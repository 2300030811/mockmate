const { GoogleGenerativeAI } = require("@google/generative-ai");
const fetch = require('node-fetch');

const API_KEY = process.env.GOOGLE_API_KEY || "AIzaSyDZt_JIRW3mwXnxekXPpBZe-zTBuc-ppFk";

async function run() {
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`);
  const data = await response.json();
  if (data.models) {
    console.log(data.models.map(m => m.name).join('\\n'));
  } else {
    console.log(data);
  }
}
run();
