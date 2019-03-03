const amqp = require("amqplib/callback_api");

module.exports = function(couch, productsDbName, budgetsDbName) {
  amqp.connect(
    "amqp://localhost",
    function(err, conn) {
      conn.createChannel(function(err, ch) {
        const q = "special_customer_budget";

        ch.assertQueue(q, { durable: false });
        ch.prefetch(1);
        console.log(" [x] Awaiting RPC requests");

        ch.consume(q, function reply(msg) {
          const n = JSON.parse(msg.content.toString());
          let response = {};

          console.log(msg)

          console.log(" [.] server receive", n);

          if (!n || n === {} || n === null || n === undefined) {
            return
          }

          const mangoQuery = n
            ? {
                selector: {
                  id: {
                    "$in": n.products.map(prod => prod.id)
                  }
                }
              }
            : {};
          const parameters = {};

          couch
            .mango(productsDbName, mangoQuery, parameters)
            .then(
              ({ data, headers, status }) => {
                console.log(data);

                if (data.docs && data.docs.length) {
                  let total = 0;
                  let productsResult = data.docs.map(product => {
                    let amount = n.products.find(prod => prod.id === product.id).amount
                    let value = product.price * amount
                    total += value
                    product["price"] = product.price
                    product["total"] = value

                    return product
                  });

                  response = {
                    total,
                    budgetRequestDate: n.budgetRequestDate,
                    budgetResponseDate: new Date().toLocaleDateString(),
                    products: productsResult
                  };

                  couch
                    .insert(budgetsDbName, response)
                    .then(
                      ({ data, headers, status }) => {
                        console.log("response: ", response);
                      },
                      err => {
                        console.error(err);
                      }
                    )
                } else {
                  response = {};
                }

                console.log("response: ", response);
              },
              err => {
                console.error(err);
                response = {
                  result: -1
                };
              }
            )
            .then(() => {
              ch.sendToQueue(
                msg.properties.replyTo,
                new Buffer(JSON.stringify(response)),
                {
                  correlationId: msg.properties.correlationId
                }
              );

              ch.ack(msg);
            });
        });
      });
    }
  );
};
