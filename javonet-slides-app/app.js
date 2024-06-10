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
  
      const slides = files.map(file => {
        const filePath = path.join(slideSetPath, file);
        const isDirectory = fs.statSync(filePath).isDirectory();
        const extension = path.extname(file);
  
        if (!isDirectory && extension === '.mp4') {
          return `<video src="/slides/${req.params.slideSet}/${file}" style="display: none;" class="slide" muted></video>`;
        } else {
          return `<img src="/slides/${req.params.slideSet}/${file}" style="display: none;" class="slide" />`;
        }
      }).join('');
  
      const html = `
        ${slides}
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
          const slides = Array.from(document.getElementsByClassName('slide'));
          slides[i].style.display = 'block';
  
          function changeSlide() {
            slides[i].style.display = 'none';
            i = (i + 1) % slides.length;
            slides[i].style.display = 'block';
            if (slides[i].tagName === 'VIDEO') {
              slides[i].play();
              slides[i].onended = changeSlide;
            } else {
              setTimeout(changeSlide, 5000);  // Change slide every 3 seconds
            }
          }
  
          if (slides[i].tagName === 'VIDEO') {
            slides[i].play();
            slides[i].onended = changeSlide;
          } else {
            setTimeout(changeSlide, 5000);  // Change slide every 3 seconds
          }
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