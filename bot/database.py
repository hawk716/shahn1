import sqlite3
import json
from datetime import datetime
from typing import Optional, List, Dict

class Database:
    def __init__(self, db_path: str = 'bot_data.db'):
        self.db_path = db_path
        self.init_db()
    
    def init_db(self):
        """إنشاء جداول قاعدة البيانات"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # جدول المشرفين
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS admins (
                user_id INTEGER PRIMARY KEY,
                username TEXT,
                role TEXT DEFAULT 'assistant',
                added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        # إضافة المشرف الرئيسي (صاحب الآيدي 8083596989)
        cursor.execute('''
            INSERT OR IGNORE INTO admins (user_id, username, role)
            VALUES (8083596989, 'MasterAdmin', 'master')
        ''')
        
        # جدول طلبات السحب
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS withdrawal_requests (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                request_id TEXT UNIQUE,
                user_id INTEGER,
                username TEXT,
                app_name TEXT,
                currency TEXT,
                amount REAL,
                account_number TEXT,
                total_balance REAL,
                previous_withdrawals TEXT,
                account_creation_date TEXT,
                success_count INTEGER DEFAULT 0,
                failed_count INTEGER DEFAULT 0,
                status TEXT DEFAULT 'pending',
                approved_by INTEGER,
                approved_at TIMESTAMP,
                message_id INTEGER,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        conn.commit()
        conn.close()
    
    def add_admin(self, user_id: int, username: str) -> bool:
        """إضافة مشرف جديد"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            cursor.execute('''
                INSERT OR REPLACE INTO admins (user_id, username, role)
                VALUES (?, ?, 'assistant')
            ''', (user_id, username))
            conn.commit()
            conn.close()
            return True
        except Exception as e:
            print(f"Error adding admin: {e}")
            return False
    
    def is_admin(self, user_id: int) -> bool:
        """التحقق من أن المستخدم مشرف"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        cursor.execute('SELECT * FROM admins WHERE user_id = ?', (user_id,))
        result = cursor.fetchone()
        conn.close()
        return result is not None
    
    def is_master_admin(self, user_id: int) -> bool:
        """التحقق من أن المستخدم مشرف رئيسي"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        cursor.execute('SELECT role FROM admins WHERE user_id = ?', (user_id,))
        result = cursor.fetchone()
        conn.close()
        return result and result[0] == 'master'
    
    def save_withdrawal_request(self, request_data: Dict) -> str:
        """حفظ طلب سحب جديد"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            request_id = f"WR-{datetime.now().strftime('%Y%m%d%H%M%S')}-{request_data.get('user_id', '0')}"
            
            cursor.execute('''
                INSERT INTO withdrawal_requests 
                (request_id, user_id, username, app_name, currency, amount, account_number,
                 total_balance, previous_withdrawals, account_creation_date, success_count, failed_count)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                request_id,
                request_data.get('user_id'),
                request_data.get('username'),
                request_data.get('app_name'),
                request_data.get('currency'),
                request_data.get('amount'),
                request_data.get('account_number'),
                request_data.get('total_balance'),
                request_data.get('previous_withdrawals', '0'),
                request_data.get('account_creation_date'),
                request_data.get('success_count', 0),
                request_data.get('failed_count', 0)
            ))
            
            conn.commit()
            conn.close()
            return request_id
        except Exception as e:
            print(f"Error saving withdrawal request: {e}")
            return None
    
    def update_request_status(self, request_id: str, status: str, admin_id: int = None, message_id: int = None):
        """تحديث حالة الطلب"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            cursor.execute('''
                UPDATE withdrawal_requests 
                SET status = ?, approved_by = ?, approved_at = ?, message_id = ?
                WHERE request_id = ?
            ''', (status, admin_id, datetime.now().isoformat(), message_id, request_id))
            
            conn.commit()
            conn.close()
        except Exception as e:
            print(f"Error updating request status: {e}")
    
    def get_latest_requests(self, limit: int = 10) -> List[Dict]:
        """الحصول على آخر طلبات السحب"""
        try:
            conn = sqlite3.connect(self.db_path)
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()
            
            cursor.execute('''
                SELECT * FROM withdrawal_requests 
                ORDER BY created_at DESC 
                LIMIT ?
            ''', (limit,))
            
            results = [dict(row) for row in cursor.fetchall()]
            conn.close()
            return results
        except Exception as e:
            print(f"Error getting latest requests: {e}")
            return []
    
    def get_request_by_id(self, request_id: str) -> Optional[Dict]:
        """الحصول على طلب سحب محدد"""
        try:
            conn = sqlite3.connect(self.db_path)
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()
            
            cursor.execute('SELECT * FROM withdrawal_requests WHERE request_id = ?', (request_id,))
            result = cursor.fetchone()
            conn.close()
            
            return dict(result) if result else None
        except Exception as e:
            print(f"Error getting request: {e}")
            return None
