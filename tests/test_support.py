import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch
import sqlite3
from contextlib import closing
import main

class SupportTests(unittest.TestCase):
    def setUp(self):
        self.api = patch.object(main, "classify_problem", return_value=None)
        self.api.start()
        self.addCleanup(self.api.stop)
    def test_all_exact_queries_return_matching_problem(self):
        for row in main.data.to_dict("records"):
            match, score, _ = main.find_best_match(row["problem"])
            self.assertEqual(match["problem"], row["problem"])
            self.assertGreater(score, .99)
    def test_greeting_preserves_clarification_context(self):
        state = {**main.new_session(), "context": ["البوابة"], "awaiting": True, "attempt": 1}
        _, result = main.respond("أهلاً!", session_state=state)
        self.assertEqual(result, state)
        self.assertEqual(state["context"], ["البوابة"])
    def test_vague_problem_requires_details(self):
        _, state = main.respond("عندي مشكلة")
        self.assertTrue(state["awaiting"])
        self.assertEqual(state["attempt"], 1)
    def test_scope_check_before_followup(self):
        state = {**main.new_session(), "context": ["البوابة"], "awaiting": True}
        answer, result = main.respond("نتفليكس لا يعمل", session_state=state)
        self.assertIn("خارج نطاق", answer)
        self.assertEqual(result["context"], ["البوابة"])
    def test_model_cannot_invent_article_id(self):
        with patch.object(main, "classify_problem", return_value={"type": "solution", "id": "99999"}):
            _, state = main.respond("عندي مشكلة في شيء غير معروف")
            self.assertTrue(state["awaiting"])
    def test_ticket_stored_transactionally(self):
        with tempfile.TemporaryDirectory() as directory, patch.object(main, "DATA_DIR", Path(directory)):
            answer, state = main.respond("مشكلة جديدة في الجهاز الجامعي", force_ticket=True)
            self.assertIn("SC-", answer)
            self.assertFalse(state["awaiting"])
            with closing(sqlite3.connect(Path(directory)/"complaints.sqlite3")) as db:
                self.assertEqual(db.execute("SELECT count(*) FROM complaints").fetchone()[0], 1)
    def test_storage_failure_does_not_claim_success(self):
        with patch.object(main, "log_missed_question", side_effect=sqlite3.OperationalError("unavailable")):
            answer, state = main.respond("مشكلة جديدة في الجهاز الجامعي", force_ticket=True)
            self.assertIn("لم يتم إنشاء", answer)
            self.assertTrue(state["awaiting"])
    def test_clarification_bounded(self):
        with tempfile.TemporaryDirectory() as directory, patch.object(main, "DATA_DIR", Path(directory)), patch.object(main, "classify_problem", return_value={"type":"clarify","question":"ما رسالة الخطأ؟"}):
            _, state = main.respond("عندي مشكلة")
            _, state = main.respond("في البوابة", session_state=state)
            answer, state = main.respond("لا أعرف", session_state=state)
            self.assertIn("SC-", answer)
            self.assertFalse(state["awaiting"])
    def test_oversized_input_does_not_call_model(self):
        reply, state = main.respond("x"*2001)
        self.assertIn("2000",reply)
        self.assertFalse(state["awaiting"])

if __name__ == "__main__":
    unittest.main()
