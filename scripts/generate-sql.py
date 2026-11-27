
import json

with open("scripts/third-party-resources.json") as f:
    resources = json.load(f)

sql_lines = []
for resource in resources:
    columns = []
    values = []
    for k, v in resource.items():
        if isinstance(v, bool):
            values.append("1" if v else "0")
        elif isinstance(v, (int, float)):
            values.append(str(v))
        elif isinstance(v, (list, dict)):
            values.append(json.dumps(v, separators=(",", ":")))
        else:
            escaped = str(v).replace("'", "''")
            values.append(f"'{escaped}'")
        columns.append(k)
    
    sql = f"INSERT INTO resources ({', '.join(columns)}) VALUES ({', '.join(values)});"
    sql_lines.append(sql)
    
    # Add duplicate check
    phone = resource['phone'].replace("'", "''")
    address = resource['address'].lower().replace("[^a-z0-9 ]", " ")
    sql_lines.append(f"SELECT id FROM resources WHERE phone = '{phone}' AND address LIKE '%{address}%' LIMIT 1;")

sql_content = "\n".join(sql_lines)
with open("scripts/import-third-party.sql", "w") as f:
    f.write(sql_content)

print("SQL file created")
print(f"Total inserts: {len(resources)}")
