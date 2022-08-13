import json
import sqlite3
from flask import request
from flask import Flask, render_template, jsonify
app = Flask(__name__)


@app.route('/')
def index():
    # empty the root_to_curr.txt file
    f = open("root_to_curr.txt", 'r+')
    f.truncate(0)
    return render_template('index.html')

@app.route('/tree.html', methods=["POST", "GET"])
def tree():
    if request.method == "POST":
        answer = request.form.get("todo") 
        print("answer from checkbox" , answer)

    return render_template('tree.html')  

@app.route('/root_to_curr', methods=['POST'])
def root_to_curr():
    output = request.get_json()
    print(output)
    print(type(output))
    result = json.loads(output)
    print(result)
    print(type(result))

    f = open('root_to_curr.txt', 'a')
    for i in range(len(result)):
        i_str = str(i)
        if '-' not in result[i_str]:
            f.write('\n')
        f.write(result[i_str])
        f.write('\n')
    
    return result

@app.route('/root_to_keyword', methods=['POST'])
def root_to_desired():
    output = request.get_json()
    print(output)
    print(type(output))
    result = json.loads(output)
    print(result)
    print(type(result))

    f = open('root_to_keyword.txt', 'w')
    for i in range(len(result)):
        i_str = str(i)
        f.write(result[i_str])
        f.write('\n')
    
    return result

@app.route('/get_subtree', methods=['POST'])
def get_subtree():
    output = request.get_json()
    print(output)
    print(type(output))
    result = json.loads(output)
    print(result)
    print(type(result))

    f = open('root_to_keyword.txt', 'w')
    for i in range(len(result)):
        i_str = str(i)
        f.write(result[i_str])
        f.write('\n')
    
    f.write('\n')
    return result


@app.route('/get_sql', methods=['POST'])
def get_sql():
    output = request.get_json()
    print(output)
    print(type(output))
    result = json.loads(output)
    print(result)
    print(type(result))
 
    # connecting to the database
    connection = sqlite3.connect("dt.db")
    
    # cursor
    crsr = connection.cursor()
    
    # print statement will execute if there
    # are no errors
    print("Connected to the database")
    
    # # SQL command to create a table in the database
    # sql_command = """CREATE TABLE houses (
    # house_number INTEGER PRIMARY KEY,
    # house_name VARCHAR(30),
    # num_of_bedrooms INTEGER,
    # square_feet INTEGER,
    # swimming_pool CHAR(1));"""
    # crsr.execute(sql_command)

    # # SQL command to insert the data in the table
    # sql_command = """INSERT INTO houses VALUES (1, "Goddard Hall", 1, 1600, 'N');"""
    # crsr.execute(sql_command)
    
    # # another SQL command to insert the data in the table
    # sql_command = """INSERT INTO houses VALUES (2, "Palladium Hall", 2, 3100, 'Y');"""
    # crsr.execute(sql_command)

    # # another SQL command to insert the data in the table
    # sql_command = """INSERT INTO houses VALUES (3, "Lipton Hall", 3, 3300, 'N');"""
    # crsr.execute(sql_command)

    crsr.execute(result['0'])
    sql_ans = crsr.fetchall()

    for i in sql_ans:
        print(i)
    
    # close the connection
    connection.close()

    return jsonify('', render_template('sql.html', x = sql_ans))



if __name__ == "__main__":
    app.run(debug=True)