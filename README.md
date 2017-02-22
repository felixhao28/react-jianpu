# react-jianpu
A numbered music notation renderer

Demo: http://felixhao28.github.io/react-jianpu/

![image](https://raw.githubusercontent.com/felixhao28/react-jianpu/master/screenshot.png)

## Interface


```js
<Jianpu
    song={song}
    sectionsPerLine={4}
    alignSections={true}
    highlight={highlightedNote}
/>
```

`song` is an array of `note`. `highlightedNote` is also a `note`. A `note` has a structure like this:

```js
{
  "pitch": {
    "base": 60, // pitch. 60 represents Middle C. Each increment represents a semitone (half step)
    "accidental": 0 // -2: double flat, -1: flat, 0: none, 1: sharp, 2: double sharp
  },
  "duration": 12, // 8 represents a crotchet. So 12 means 8+4, which is one and a half crotchet (dotted crotchet)
  "options": {}, // set "slur" to "start" or "end" to indicate the start or end of a slur
  "lyrics": {
    "exists": true, // has lyrics on this note
    "content": "Row, ", // lyrics content
    "hyphen": false // append with hyphen or not
  }
}