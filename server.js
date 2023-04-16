const express = require('express')
const axios = require('axios')
const app = express()

app.use(express.json())
const accessToken = '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'

app.use((req, res, next) => {
  const { headers } = req;
  res.header('Access-Control-Allow-Origin', headers.origin); 
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Authorization, Content-Type');
  res.header('Access-Control-Allow-Credentials', 'true');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

app.get('/api/users', async (req, res) => {
  const { since } = req.query
  try {
    const response = await axios.get(`https://api.github.com/users?since=${since}`, {
      headers: {
        Authorization: `token ${accessToken}`
      }
    })
    const links = response.headers.link.split(',')
    const nextLink = links[0].split(';')[0].slice(1, -1)
    const prevLink = links[1].split(';')[0].slice(1, -1)
    res.json({
      users: response.data,
      nextLink,
      prevLink
    })
  } catch (error) {
    console.log(error)
    res.status(500).send(error)
  }
})
app.get('/api/users/:username', async (req, res) => {
  const { username } = req.params
  try {
    const response = await axios.get(`https://api.github.com/users/${username}`, {
      headers: {
        Authorization: `token ${accessToken}`
      }
    })
    const { id, login, html_url, created_at, updated_at } = response.data
    res.json({
      id,
      login,
      html_url,
      created_at,
      updated_at,
    })
  } catch (error) {
    res.status(500).send(error)
  }
})
app.get('/api/user/repos', async (req, res) => {
  const { username } = req.query
  try {
    const response = await axios.get(`https://api.github.com/users/${username}/repos`, {
      headers: {
        Authorization: `token ${accessToken}`
      }
    })
    const repos = response.data.map(repo => {
      
      const { id, name, html_url } = repo
      return {
        id,
        name,
        html_url
      }
    })
    res.json(repos)
  } catch (error) {
    res.status(500).send(error)
  }
})


const PORT = process.env.PORT || 9000
app.listen(PORT, () => {console.log(`Server running at port ${PORT}`)})
