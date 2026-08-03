import sqlite3

DATABASE_NAME = "assistant.db"


def get_connection():
    conn = sqlite3.connect(DATABASE_NAME, timeout=10)
    return conn

def initialize_database():
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS chats (
            id INTEGER PRIMARY KEY,
            title TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            chat_id INTEGER NOT NULL,
            role TEXT NOT NULL,
            content TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(chat_id) REFERENCES chats(id)
        )
    """)

    conn.commit()
    conn.close()

def create_chat(title: str = "New Chat"):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute(
        """
        INSERT INTO chats (title)
        VALUES (?)
        """,
        (title,)
    )

    chat_id = cursor.lastrowid

    conn.commit()
    conn.close()

    return {
        "id": chat_id,
        "title": title,
        "messages": []
    }

def save_message(chat_id: int, role: str, content: str):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute(
        """
        INSERT INTO messages (chat_id, role, content)
        VALUES (?, ?, ?)
        """,
        (chat_id, role, content)
    )

    conn.commit()
    conn.close()

def get_messages(chat_id: int,limit=None):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute(
        """
        SELECT role, content
        FROM messages
        WHERE chat_id = ?
        ORDER BY id
        """,
        (chat_id,)
    )

    rows = cursor.fetchall()

    conn.close()

    messages = [
    {
        "role": role,
        "content": content
    }
    for role, content in rows
]
    if limit is not None:
        messages = messages[-limit:]

    return messages

def get_all_chats():
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT id, title
        FROM chats
        ORDER BY created_at
    """)

    rows = cursor.fetchall()
    conn.close()

    return [
        {
            "id": row[0],
            "title": row[1]
        }
        for row in rows
    ]

def get_chat(chat_id: int):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT role, content
        FROM messages
        WHERE chat_id = ?
        ORDER BY id
    """, (chat_id,))

    rows = cursor.fetchall()
    conn.close()

    return [
        {
            "role": role,
            "text": content
        }
        for role, content in rows
    ]

def get_chat_by_id(chat_id: int):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT id, title
        FROM chats
        WHERE id = ?
    """, (chat_id,))

    row = cursor.fetchone()
    conn.close()

    if row is None:
        return None

    return {
        "id": row[0],
        "title": row[1]
    }

def delete_chat(chat_id: int):
    conn = get_connection()
    cursor = conn.cursor()

    # Delete all messages in the chat
    cursor.execute(
        """
        DELETE FROM messages
        WHERE chat_id = ?
        """,
        (chat_id,)
    )

    # Delete the chat itself
    cursor.execute(
        """
        DELETE FROM chats
        WHERE id = ?
        """,
        (chat_id,)
    )

    conn.commit()
    conn.close()

def rename_chat(chat_id: int, title: str):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute(
        """
        UPDATE chats
        SET title = ?
        WHERE id = ?
        """,
        (title, chat_id)
    )

    conn.commit()
    conn.close()

def auto_title(message: str):
    title = message.strip()

    if len(title) <= 30:
        return title

    title = title[:30]

    last_space = title.rfind(" ")

    if last_space > 10:
        title = title[:last_space]

    return title + "..."