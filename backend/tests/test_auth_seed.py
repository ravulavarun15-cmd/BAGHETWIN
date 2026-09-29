import unittest

from app.database.db import SessionLocal, init_db
from app.database.models import User


class SeedUsersTest(unittest.TestCase):
    def test_init_db_creates_demo_accounts(self):
        init_db()
        with SessionLocal() as db:
            emails = {u.email for u in db.query(User).all()}
            self.assertIn('admin@sih26120.local', emails)
            self.assertIn('user@sih26120.local', emails)


if __name__ == '__main__':
    unittest.main()
