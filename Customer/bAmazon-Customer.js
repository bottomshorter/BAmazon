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
    //Function to load items to user goes here
    loadItems();
});

//Function to load items table from the DB
function loadItems() {
    connection.query("SELECT * FROM products", function (err, res) {
        if (err) throw err;
        console.table(res);
        //Function to prompt user to proceed to select products
        promptUser(res);
    });
};

//Prompt the user to choose a product
function promptUser(inventory) {
    inquirer
        .prompt([
            {
                type: "input",
                name: "userchoice",
                message: "Which id would you like to choose buy? (input q to quit)",
                validate: function (payload) {
                    return !isNaN(payload) || payload.toLowerCase() === "q";
                }
            }
        ])
        .then(function (payload) {
            //Check if user inputs quit value
            checkQuit(payload.userchoice);

            var choiceId = parseInt(payload.userchoice);
            var product = checkInv(choiceId, inventory)

            if (product) {
                // Pass the chosen product to promptUserForQuantity
                promptUserForQuantity(product);
            }
            else {
                // If id doesnt exist, notify customer, and call loadItems();
                console.log("----------------------------------");
                console.log("That item is not in the inventory.");
                console.log("----------------------------------");
                loadItems();
            }

        });
};

// Prompt the customer for a product quantity
function promptUserForQuantity(product) {
    inquirer
        .prompt([
            {
                type: "input",
                name: "userquantity",
                message: "How many would you like? (input q to quit)",
                validate: function (payload) {
                    return payload > 0 || payload.toLowerCase() === "q";
                }
            }
        ])
        .then(function (val) {
            // Check if the user wants to quit
            checkQuit(val.userquantity);
            var quantity = parseInt(val.userquantity);

            // If there isn't enough stock, notify user and call loadItems();
            if (quantity > product.stock_quantity) {
                console.log("----------------------------------");
                console.log("Quantity not valid, please enter a valid number!");
                console.log("----------------------------------");
                loadItems();
            }
            else {
                // Else, call makePurchase, pass through the information 
                makePurchase(product, quantity);
            }
        });
}



// Purchase the desired quantity of the desired item
function makePurchase(product, quantity) {
    connection.query(
        "UPDATE products SET stock_quantity = stock_quantity - ? WHERE item_id = ?",
        [quantity, product.item_id],
        function (err, res) {
            // Let the user know the purchase was successful, then call loadItem();
            console.log("----------------------------------");
            console.log("\nSuccessfully purchased " + quantity + " " + product.product_name + "'s!");
            console.log("----------------------------------");
            loadItems();
        }
    );
}

//Function to check if the id that the user exists within the DB
function checkInv(choiceId, inventory) {
    for (var i = 0; i < inventory.length; i++) {
        if (inventory[i].item_id === choiceId) {
            // If a matching product is found, return the product
            return inventory[i];
        }
    }
    // Otherwise return null
    return null;
}

// Check to see if the user wants to quit
function checkQuit(userchoice) {
    if (userchoice.toLowerCase() === "q") {
        // Log a message and exit the current node process
        console.log("Goodbye!");
        process.exit(0);
    }
}