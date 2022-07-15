import json
from flask import request
from flask import Flask, render_template
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

    f = open('root_to_keyword.txt', 'a')
    for i in range(len(result)):
        i_str = str(i)
        f.write(result[i_str])
        f.write('\n')
    
    f.write('\n')
    return result



if __name__ == "__main__":
    app.run(debug=True)