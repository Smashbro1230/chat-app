const socket = io();

let user = "";
let userColor = "#0000ff";
let userProfile = "";
let usernameLocked = false;
let kickedUsers = [];
let isMod = false;
let role = "";
let onlineVisible = false;

const MOD_PASSWORD = "mod123";
const ADMIN_PASSWORD = "admin123";

function setUsername() {
  const name = document.getElementById("username").value.trim();
  const color = document.getElementById("colorPicker").value;
  const pic = document.getElementById("profilePic").value.trim();
  if (!name) { alert("Username required"); return; }
  if (usernameLocked) { alert("Username already set"); return; }
  user = name; userColor = color; userProfile = pic || "";
  usernameLocked = true;
  localStorage.setItem("chatUsername", user);
  localStorage.setItem("chatColor", userColor);
  localStorage.setItem("chatProfile", userProfile);

  socket.emit("join", user);
  alert("Username set: " + user);
}

function changeProfilePic() {
  const pic = document.getElementById("profilePic").value.trim();
  if (!pic) return;
  userProfile = pic;
  localStorage.setItem("chatProfile", userProfile);
  alert("Profile picture updated!");
}

function toggleDarkMode() {
  document.body.classList.toggle("dark");
}

function toggleOnlineUsers() {
  if (role !== "Admin") return;
  onlineVisible = !onlineVisible;
  document.getElementById("onlineUsers").style.display = onlineVisible ? "block" : "none";
}

function sendMessage() {
  const msg = document.getElementById("msg").value.trim();
  if (!msg || !user) return;
  if (kickedUsers.includes(user)) { alert("You are kicked"); return; }
  const data = { user, text: msg, color: userColor, profile: userProfile, role };
  socket.emit("chat message", data);
  document.getElementById("msg").value = "";
}

function modLogin() {
  const pass = document.getElementById("modPass").value;
  if (pass === MOD_PASSWORD) { isMod = true; role = "Moderator"; document.getElementById("modPanel").style.display = "block"; alert("Moderator logged in!"); }
  else if (pass === ADMIN_PASSWORD) { isMod = true; role = "Admin"; document.getElementById("modPanel").style.display = "block"; alert("Admin logged in!"); }
  else { alert("Incorrect password"); }
}

function kickUser() {
  if (!isMod) return;
  const name = document.getElementById("kickName").value.trim();
  if (!name) return;
  kickedUsers.push(name);
  alert(name + " has been kicked");
}

socket.on("chat message", (data) => {
  const box = document.getElementById("chatBox");
  const bubble = document.createElement("div");
  bubble.className = "bubble";

  if (data.profile) {
    const img = document.createElement("img");
    img.src = data.profile;
    img.className = "profilePic";
    bubble.appendChild(img);
  }

  const nameTag = document.createElement("div");
  nameTag.className = "username";
  nameTag.style.color = data.color;
  nameTag.textContent = data.user;
  if (data.role) {
    const roleTag = document.createElement("span");
    roleTag.className = "roleTag";
    roleTag.textContent = data.role;
    nameTag.appendChild(roleTag);
  }

  const msgTag = document.createElement("div");
  msgTag.textContent = data.text;

  bubble.appendChild(nameTag);
  bubble.appendChild(msgTag);
  box.appendChild(bubble);
  box.scrollTop = box.scrollHeight;
});

socket.on("updateOnline", (users) => {
  document.getElementById("onlineUsers").innerHTML = "<b>Online:</b> " + users.join(", ");
});
