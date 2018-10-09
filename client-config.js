let clientHost;

const hostname = window && window.location && window.location.hostname;
console.log("HOSTNAME", hostname);
if (hostname === "https://soyumapi.herokuapp.com") {
  clientHost = "https://soyum.herokuapp.com";
} else {
  clientHost = "http://localhost:3000";
}

const CLIENT_HOST = `${clientHost}`;
