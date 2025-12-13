from sqlalchemy import create_engine, inspect

db_path = "sqlite:///./studybuddy_v2.db"
engine = create_engine(db_path)
inspector = inspect(engine)

tables = inspector.get_table_names()
print(f"Tables: {tables}")

target_tables = ['students', 'questions']
for table in target_tables:
    if table in tables:
        print(f"\nTable: {table}")
        for col in inspector.get_columns(table):
            print(f"  - {col['name']}")
    else:
        print(f"\nTable {table} NOT FOUND")
