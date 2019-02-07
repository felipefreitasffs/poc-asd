var queue = require("../helpers/queue");

module.exports = function(socket) {
  socket.on("list_users", function(filter) {
    queue(filter, socket, "list_users", "filtered_users");
  });

  socket.on("add_users", function(user) {
    queue(user, socket, "add_user", "add_user_result");
  });

  socket.on("delete_users", function(user) {
    queue(user, socket, "delete_user", "delete_user_result");
  });

  socket.on("edit_users", function(user) {
    queue(user, socket, "edit_user", "edit_user_result");
  });

  socket.on("list_profiles", function(filter) {
    queue(filter, socket, "list_profiles", "filtered_profiles");
  });
}