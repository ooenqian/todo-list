let tasks = []; //Store all tasks 
let editingTaskId = null; //Track which task is being edited

//Get elements from HTML 
const taskList = document.getElementById("taskList");
const taskFilter = document.getElementById("taskFilter");
const taskModal = document.getElementById("taskModal");
const taskForm = document.getElementById("taskForm");

const taskTitle = document.getElementById("taskTitle");
const taskDescription = document.getElementById("taskDescription");
const taskPriority = document.getElementById("taskPriority");

const addTaskButton = document.getElementById("addTask");
const saveButton = document.getElementById("saveButton");
const formHeading = document.getElementById("formHeading");
const emptyMessage = document.getElementById("emptyMessage");

//Open the popup 
function openModal() {
    taskModal.classList.remove("hidden"); //Remove hidden class
    taskTitle.focus(); //Focus on the title (user can enter immediately)
}

//Close and reset the popup 
function closeModal() {
    taskModal.classList.add("hidden");
    taskForm.reset();
    editingTaskId = null;
    formHeading.textContent = "Add Task";
    saveButton.textContent = "Add Task";
}

//Click to add task
addTaskButton.addEventListener("click", function () {
    closeModal();
    openModal();
});

//Close the popup when button is click
document.getElementById("closeModal").addEventListener("click", closeModal);
document.getElementById("cancelButton").addEventListener("click", closeModal);

//Close the popup only when the user clicks the background outside the form
taskModal.addEventListener("click", function (event) {
    if (event.target === taskModal) {
        closeModal();
    }
});

//Handle both adding and editing tasks when the form is submitt
taskForm.addEventListener("submit", function (event) {
    event.preventDefault(); //Stop the page from refreshing when the form is submitted

    //Get the user's input
    let title = taskTitle.value.trim(); //Remove extra spaces
    let description = taskDescription.value.trim();
    let priority = taskPriority.value;

    //Make sure the task has a title
    if (title === "") {
        alert("Please enter a task title.");
        return;
    }

    if (editingTaskId === null) {
        //Create a new task object
        let task = {
            id: Date.now(), //Give the task an ID (for editing)
            title: title,
            description: description,
            priority: priority,
            completed: false //Added tasks start as pending
        };

        tasks.push(task); //Add the new task object to the array
    } else {
        //Find the selected task by its ID and update its information
        for (let i = 0; i < tasks.length; i++) {
            if (tasks[i].id === editingTaskId) {
                tasks[i].title = title;
                tasks[i].description = description;
                tasks[i].priority = priority;
            }
        }
    }

    closeModal();
    displayTasks(); //Refresh the list to show the latest task information
});

//Display tasks on the webpage
function displayTasks() {
    taskList.innerHTML = ""; //Clear old task cards before displaying the updated list

    //Sort tasks by priority 
    for (let i = 0; i < tasks.length; i++) {
        for (let j = 0; j < tasks.length - 1; j++) {
            let firstNumber = 3;
            let secondNumber = 3;

            //Convert priority into numbers for comparison
            if (tasks[j].priority === "High") {
                firstNumber = 1;
            } else if (tasks[j].priority === "Medium") {
                firstNumber = 2;
            }

            if (tasks[j + 1].priority === "High") {
                secondNumber = 1;
            } else if (tasks[j + 1].priority === "Medium") {
                secondNumber = 2;
            }

            //Arrange the order
            if (firstNumber > secondNumber) {
                let temp = tasks[j];
                tasks[j] = tasks[j + 1];
                tasks[j + 1] = temp;
            }
        }
    }

    //Get the selected filter and count how many tasks will be displayed
    let filter = taskFilter.value;
    let count = 0;

    for (let i = 0; i < tasks.length; i++) {
        let task = tasks[i];

        //Skip completed tasks when showing Pending tasks
        if (filter === "Pending" && task.completed) {
            continue;
        }

        //Skip pending tasks when showing Completed tasks
        if (filter === "Completed" && !task.completed) {
            continue;
        }

        count++;

        //Create a task card and apply its priority class for CSS styling
        let card = document.createElement("div");
        card.className = "task-card priority-" + task.priority.toLowerCase();

        //Add a CSS class to change the appearance of completed tasks
        if (task.completed) {
            card.classList.add("completed");
        }

        //Tick completed button
        let tickButton = document.createElement("button");
        tickButton.className = "tick-button";
        tickButton.textContent = task.completed ? "✓" : "";
        tickButton.type = "button";
        tickButton.title = task.completed ? "Mark as pending" : "Mark as completed";

        tickButton.onclick = function () {
            task.completed = !task.completed; //Change true to false, or false to true
            displayTasks(); 
        };

        card.appendChild(tickButton);

        //Create the task information container and display the title
        let content = document.createElement("div");
        content.className = "task-content";

        let title = document.createElement("h3");
        title.className = "task-title";
        title.textContent = task.title;
        content.appendChild(title);

        //Only display the description if the user entered 
        if (task.description !== "") {
            let description = document.createElement("p");
            description.className = "task-description";
            description.textContent = task.description;
            content.appendChild(description);
        }

        //Create badges to show the task's priority and current status
        let meta = document.createElement("div");
        meta.className = "task-meta";

        let priorityBadge = document.createElement("span");
        priorityBadge.className = "badge priority-badge-" + task.priority.toLowerCase();
        priorityBadge.textContent = task.priority + " Priority";

        let statusBadge = document.createElement("span");
        statusBadge.className = "badge status-badge";

        if (task.completed) {
            statusBadge.textContent = "Completed";
        } else {
            statusBadge.textContent = "Pending";
        }

        meta.appendChild(priorityBadge);
        meta.appendChild(statusBadge);
        content.appendChild(meta);

        //Create the Edit and Delete buttons for each task
        let actions = document.createElement("div");
        actions.className = "task-actions";

        //Edit button: fill the popup with existing details so the user can update them
        let editButton = document.createElement("button");
        editButton.className = "edit-button";
        editButton.textContent = "Edit";
        editButton.type = "button";

        editButton.onclick = function () {
            editingTaskId = task.id; //Remember which task is being editing

            taskTitle.value = task.title;
            taskDescription.value = task.description;
            taskPriority.value = task.priority;

            formHeading.textContent = "Edit Task";
            saveButton.textContent = "Save Changes";

            openModal();
        };

        //Delete button: ask for confirmation before removing the selected task
        let deleteButton = document.createElement("button");
        deleteButton.className = "delete-button";
        deleteButton.textContent = "Delete";
        deleteButton.type = "button";

        deleteButton.onclick = function () {
            if (confirm("Are you sure you want to delete this task?")) {
                let newTasks = [];

                //Copy every task except the one selected for deletion
                for (let j = 0; j < tasks.length; j++) {
                    if (tasks[j].id !== task.id) {
                        newTasks.push(tasks[j]);
                    }
                }

                tasks = newTasks; //Replace the old array without the deleted task
                displayTasks(); //Refresh the task list
            }
        };

        //Place the buttons and task information inside the card
        actions.appendChild(editButton);
        actions.appendChild(deleteButton);
        content.appendChild(actions);

        card.appendChild(content);
        taskList.appendChild(card); //Add the completed card to the webpage
    }

    //Show a suitable message if no tasks match the selected filter
    if (count === 0) {
        emptyMessage.classList.remove("hidden");

        if (filter === "Pending") {
            emptyMessage.textContent = "No pending tasks!";
        } else if (filter === "Completed") {
            emptyMessage.textContent = "No completed tasks yet.";
        } else {
            emptyMessage.textContent = "No tasks yet. Add your first task above!";
        }
    } else {
        emptyMessage.classList.add("hidden"); //Hide the message when tasks are displayed
    }
}

//Refresh the task list whenever the user selects a different filter
taskFilter.addEventListener("change", function () {
    displayTasks();
});

//Display the initial task list when the website opens
displayTasks();