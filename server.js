const express = require('express');
const axios = require('axios');
const app = express();
const port = 3000;
const { Configuration, OpenAIApi } = require('openai');

const configuration = new Configuration({
  apiKey: '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'
});

const openai = new OpenAIApi(configuration);

app.use(express.json());
app.use(express.static('public')); // To serve your static files

const Filter = require('bad-words'); // import the bad-words library
const filter = new Filter(); // create a new instance

// Endpoint to generate tags
app.post('/generate-tags', async (req, res) => {
  const title = req.body.searchTerm;

  if (filter.isProfane(title)) { // checks if the string contains bad words
    return res.status(400).send('The search term contains inappropriate words');
  }

  try {
    // Instruct the model to generate 5 SEO-optimized, clickable titles
    const prompt = `You are the YouTool.io Analyzer Bot, a YouTube SEO strategist. Your task is to generate 20 SEO-optimized video tags for this video title: "${title}". Here are a few parameters to follow: Do not number the tags. Instead, Each tag should be 1-4 words and each tag should be separated by a comma, avoid using profanity, do not exceed 400 max characters, and frontload the tags with keywords from the video title. `

    const gptResponse = await openai.createCompletion({
      model: 'text-davinci-003',
      max_tokens: 2048,
      temperature: 0.5,
      prompt: prompt
    });


    // Extract the tags from the response
    const tags = gptResponse.data.choices[0].text.split(',').map(tag => tag.trim()).filter(tag => tag);

    // Send the tags back to the client
    res.json(tags);
  } catch (error) {
    console.error(error);
    res.status(500).send('Failed to generate tags');
  }
});

app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`)
});
