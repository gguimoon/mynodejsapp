// http://ec2-13-125-232-202.ap-northeast-2.compute.amazonaws.com:8080

var express = require("express");
var bodyParser = require("body-parser");
var mysql = require("mysql");

var app = express();
var port = process.env.PORT || 8080;

var con = mysql.createConnection({
    host: "tutorial-db-instance.cmh7xi9uudoy.ap-northeast-2.rds.amazonaws.com",
    user: "tutorial_user",
    password: "srch&lite5",
    database: "mytodo"
});

var task = [];
var complete = [];

con.connect((err) => {
    if (err) throw err;
    var sql = `SELECT * FROM ToDo`;
    con.query(sql, (err, result) => {
        if (err) throw err;
        console.log(result);
        for (var i = 0; i < result.length; i++) {
            if (result[i].complete == "No")
                task.push(result[i].title);
            else
                complete.push(result[i].title);
        }
    });
});

function addNewTask(title) {
    var sql = `INSERT INTO ToDo (title, complete) VALUES ('${title}', 'No')`;
    con.query(sql, (err, result) => {
        if (err) throw err;
        console.log(result.affectedRows + " record(s) inserted");
    });
}

function updateTask(title, complete) {
    var sql = `UPDATE ToDo SET complete = '${complete}' WHERE title = '${title}'`;
    con.query(sql, (err, result) => {
        if (err) throw err;
        console.log(result.affectedRows + " record(s) updated");
    });
}

function delOldTask(title) {
    var sql = `DELETE FROM ToDo WHERE title = '${title}'`;
    con.query(sql, (err, result) => {
        if (err) throw err;
        console.log(result.affectedRows + " record(s) deleted");
    });
}

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.set("view engine", "ejs");

app.get("/", (req, res) => {
    res.render("index", { task: task, complete: complete });
});

app.post("/addtask", (req, res) => {
    var newTask = req.body.newtask;
    task.push(newTask);
    addNewTask(newTask);
    res.redirect("/");
});

app.post("/removetask", (req, res) => {
    var completeTask = req.body.check;
    if (typeof completeTask == "string") {
        complete.push(completeTask);
        updateTask(completeTask, "Yes");
        task.splice(task.indexOf(completeTask), 1);
    } else if (typeof completeTask == "object") {
        for (var i = 0; i < completeTask.length; i++) {
            complete.push(completeTask[i]);
            updateTask(completeTask[i], "Yes");
            task.splice(task.indexOf(completeTask[i]), 1);
        }
    }
    res.redirect("/");
});

app.post("/revoketask", (req, res) => {
    var revokeTask = req.body.choose;
    if (typeof revokeTask == "string") {
        task.push(revokeTask);
        updateTask(revokeTask, "No");
        complete.splice(complete.indexOf(revokeTask), 1);
    } else if (typeof revokeTask == "object") {
        for (var i = 0; i < revokeTask.length; i++) {
            task.push(revokeTask[i]);
            updateTask(revokeTask[i], "No");
            complete.splice(complete.indexOf(revokeTask[i]), 1);
        }
    }
    res.redirect("/");
});

app.post("/deltask", (req, res) => {
    var delTask = req.body.choose;
    if (typeof delTask == "string") {
        delOldTask(delTask);
        complete.splice(complete.indexOf(delTask), 1);
    } else if (typeof delTask == "object") {
        for (var i = 0; i < delTask.length; i++) {
            delOldTask(delTask[i]);
            complete.splice(complete.indexOf(delTask[i]), 1);
        }
    }
    res.redirect("/");
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}.`);
});
