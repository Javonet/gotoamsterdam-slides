const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 3000;
app.get('/', (req, res) => {
    const slidesPath = path.join(__dirname, 'slides');
  
    fs.readdir(slidesPath, (err, slideSets) => {
      if (err) {
        console.log(err);
        res.status(500).send('An error occurred while reading the slides directory.');
        return;
      }
  
      const html = `
        <h1>Welcome to the slideshow app!</h1>
        <p>Navigate to a slide set to view a slideshow:</p>
        <ul>
          ${slideSets.map(slideSet => `<li><a href="/slides/${slideSet}">${slideSet}</a></li>`).join('')}
        </ul>
      `;
  
      res.send(html);
    });
  });

  app.get('/slides/:slideSet', (req, res) => {
    const slideSetPath = path.join(__dirname, 'slides', req.params.slideSet);
  
    fs.readdir(slideSetPath, (err, files) => {
      if (err) {
        console.log(err);
        res.status(500).send('An error occurred while reading the slide set directory.');
        return;
      }

          files.sort((a, b) => {
      const numberA = parseInt(a.match(/\d+/g), 10);
      const numberB = parseInt(b.match(/\d+/g), 10);
      return numberA - numberB;
    });

    const html = `
    ${files.map(file => `<img src="/slides/${req.params.slideSet}/${file}" style="display: none;" class="slide" />`).join('')}
    <style>
      body, html {
        margin: 0;
        padding: 0;
        height: 100%;
        overflow: hidden;
      }
      .slide {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    </style>
    <script>
      let i = 0;
      const images = Array.from(document.getElementsByClassName('slide'));
      images[i].style.display = 'block';
  
      setInterval(() => {
        images[i].style.display = 'none';
        i = (i + 1) % images.length;
        images[i].style.display = 'block';
      }, 5000);  // Change slide every 3 seconds
    </script>
  `;
  
  res.send(html);
  });
});

app.use('/slides/:slideSet/:slide', (req, res) => {
  const slidePath = path.join(__dirname, 'slides', req.params.slideSet, req.params.slide);
  res.sendFile(slidePath);
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});