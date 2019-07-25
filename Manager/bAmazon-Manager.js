// Initializes the npm packages used
var mysql = require("mysql");
var inquirer = require("inquirer");
require("console.table");

// Initializes the connection variable to sync with a MySQL database
var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "example123!",
    database: "bamazon"
});

//Connection
connection.connect(function (err) {
    if (err) {
        console.error("Error: " + err);
    }
    //Function to load manager menu
    loadManagerMenu();
});

//Function to load products table from the DB to app
function loadManagerMenu() {
    connection.query("SELECT * FROM products", function (err, res) {
        if (err) throw err;
        //Function to prompt manager to proceed to select products
        viewManagerMenu(res);
    });
};


//Function to view manager menu with options
function viewManagerMenu(products) {
    inquirer
        .prompt([
            {
                type: "list",
                name: "managerchoice",
                choices: ["View Products for Sale", "View Low Inventory", "Add to Inventory", "Add New Product", "Quit"],
                message: "Hello Mister/Miss Manager. What would you like to do?"
            }
        ])
        .then(function (payload) {
            switch (payload.managerchoice) {
                case "View Products for Sale":
                    console.table(products);
                    loadManagerMenu();
                    break;
                case "View Low Inventory":
                    LowInventory();
                    break;
                case "Add to Inventory":
                    addToInventory(products);
                    break;
                case "Add New Product":
                    promptToAddProduct(products);
                    break;
                case "Quit":
                    console.log("Goodbye!");
                    process.exit(0);
                    break;
            }
        })
};

//Function to load low inventory (anything under 5 quantity)
function LowInventory() {
    connection.query("SELECT * FROM products WHERE stock_quantity < 5", function (err, res) {
        if (err) throw err;
        //Display the table of products with low quantity
        console.table(res);
        loadManagerMenu();
    })
};

//Function to update inventory on products
function addToInventory(inventory) {
    //Display table for user so they can see current quantities of products
    console.table(inventory);
    inquirer
        .prompt([
            {
                type: "input",
                name: "managerchoice",
                message: "What is the ID of the product you want to update?",
                validate: function (payload) {
                    return !isNaN(payload);
                }
            }
        ])
        .then(function (payload) {
            var choiceID = parseInt(payload.managerchoice)
            var product = checkInventory(choiceID, inventory);

            if (product) {
                promptManagerQuantity(product);
            }
            else {
                console.log("That product is not in the inventory.");
                loadManagerMenu();
            }
        });
}

//Function to ask Manager quantity desired to be added
function promptManagerQuantity(product){
    inquirer
    .prompt([
        {
            type: "input",
            name: "quantity",
            message: "What is the quantity you want to add?",
            validate: function(payload){
                return payload > 0;
            }
        }
    ])
    .then(function(payload){
        var quantity = parseInt(payload.quantity);
        addManagerQuantity(product, quantity);
    });
}

//Function to update SQL with appropriate amount
function addManagerQuantity(product, quantity) {
    connection.query(
        "UPDATE products SET stock_quantity = ? WHERE item_id = ?",
        [product.stock_quantity + quantity, product.item_id],
        function (err, res) {
            // Let the user know the purchase was successful, re-run loadProducts
            console.log("Successfully added " + quantity + " " + product.product_name + "'s!\n");
            loadManagerMenu();
        }
    );
}

//Function to allow manage to add products for sale
function promptToAddProduct(products) {
    inquirer
        .prompt([
            {
                type: "input",
                name: "product_name",
                message: "What is the name of the product you want to add?"
            },
            {
                type: "list",
                name: "department_name",
                choices: getDepartments(products),
                message: "Which department is the product categorized as?"
            },
            {
                type: "input",
                name: "price",
                message: "How much is the price per unit?",
                validate: function (payload) {
                    return payload > 0;
                }
            },
            {
                type: "input",
                name: "quantity",
                message: "How many do we have?",
                validate: function (payload) {
                    return !isNaN(payload);
                }
            }
        ])
        .then(addNewProduct);
}

//Function to add new product into SQL
function addNewProduct(payload) {
    connection.query(
        "INSERT INTO products (product_name, department_name, price, stock_quantity) VALUES (?, ?, ?, ?)",
        [payload.product_name, payload.department_name, payload.price, payload.quantity],
        function (err, res) {
            if (err) throw (err);
            console.log(payload.produt_name + " added to DB");
            //call loadManagerMenu
            loadManagerMenu();
        }
    );
};

// Take an array of product objects, return an array of their unique departments
function getDepartments(products) {
    var departments = [];
    for (var i = 0; i < products.length; i++) {
        if (departments.indexOf(products[i].department_name) === -1) {
            departments.push(products[i].department_name);
        }
    }
    return departments;
};

// Check to see if the product the user chose exists in the inventory
function checkInventory(choiceId, inventory) {
    for (var i = 0; i < inventory.length; i++) {
        if (inventory[i].item_id === choiceId) {
            // If a matching product is found, return the product
            return inventory[i];
        }
    }
    // Otherwise return null
    return null;
}