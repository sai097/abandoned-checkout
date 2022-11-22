var express = require('express');
var app = express();
var bodyParser = require('body-parser');
const schedule = require('node-schedule');

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
  extended: true
}));

app.set('port', process.env.PORT || 3000);

app.set('views', __dirname + '/views');
app.set('view engine', 'jade');

// app.use(express.json());
// app.use(express.urlencoded());
let messagesSent = [];
let ordersPlaced = [];

let checkoutsAbandoned = [];

app.get('/', function (req, res) {
  res.render('index.jade', {
    messages: messagesSent,
    orders: ordersPlaced
  })
});

/**
 * Sample request
 * {
    "order": {
        "id": "abc",
        "customer": {
            "first_name": "Sai",
            "last_name": "Krishna",
            "email": "abc@gmail.com"
        },
        "created_at": "2022-11-22T17:54:28.000Z"
        }
    }
 */
app.post('/order-placed', function(req,res) {
  let order = req.body.order;

  ordersPlaced.push({
    id: order.id,
    client: {
      name: order.customer.first_name + order.customer.last_name,
      email: order.customer.email,
    },
    createdAt: order.created_at
  })
  
  res.end();
});


/**
 * Sample request
 * {
    "cart_token": "abc",
    "customer": {
        "first_name": "Sai",
        "last_name": "Krishna",
        "email": "abc@gmail.com"
    },
    "created_at": "2022-11-22T17:37:28.000Z"
  }
 */
app.post('/checkout-abandon', function(req,res) {
  let abandonedCart = req.body;

  console.log("request ", req.body)

  checkoutsAbandoned.push({
    cartToken: abandonedCart.cart_token,
    client: {
      name: abandonedCart.customer.first_name + abandonedCart.customer.last_name,
      email: abandonedCart.customer.email,
    },
    cartAbandonedAt: abandonedCart.created_at
  })

  let date1 = new Date(abandonedCart.created_at);
  date1.setTime(date1.getTime() + 1*60000);

  let date2 = new Date(abandonedCart.created_at);
  date2.setDate(date2.getDate() + 1);

  let date3 = new Date(abandonedCart.created_at);
  date3.setTime(date3.getDate() + 3);

  // console.log(date1, date2, date3)

  scheduleMessage(date1, abandonedCart.customer.email);
  scheduleMessage(date2, abandonedCart.customer.email);
  scheduleMessage(date3, abandonedCart.customer.email);

  res.end();
});

function scheduleMessage(date, email) {
  schedule.scheduleJob(date, function(){
    let isOrderPlaced = ordersPlaced.find(order => {
      return order.client.email === email
    })

    if (!isOrderPlaced) {
      triggerMessage(email, new Date())
    }
  });
}

function triggerMessage(email, date) {
  messagesSent.push({
    sentTo:email,
    sentAt: date
  })
}

app.listen(app.get('port'), function(){    
  
  console.log('http Express server(worker) listening on port ' + app.get('port'));
});