class ColorLog {
  constructor() {}

  static reset = '\x1b[0m';
  static backgrounds = {
    W: '\x1b[47m', // White
    G: '\x1b[42m', // Green
    R: '\x1b[41m', // Red
    B: '\x1b[44m', // Blue
    Y: '\x1b[43m'  // Yellow
  };
  static textColors = {
    W: '\x1b[37m', // White
    G: '\x1b[32m', // Green
    R: '\x1b[31m', // Red
    B: '\x1b[30m', // Black
    Y: '\x1b[33m'  // Yellow
  };

  static log(bgColor, textColor, ...texts) {
    if (bgColor === textColor) {
      console.error(`Invalid color combination: background and text cannot be the same color (${bgColor})`);
      return;
    }

    let result = '';

    texts.forEach(text => {
      if (Array.isArray(text)) {
        // If the text is an array, limit the output to the first 100 elements
        const limitedArray = text.slice(0, 100);
        const formattedArray = limitedArray.map(element => {
          if (typeof element === 'object') {
            // If the element is an object, convert it to a JSON string
            return JSON.stringify(element, null, 2);
          }
          return element;
        });
        result += `${this.backgrounds[bgColor]}${this.textColors[textColor]}[${formattedArray.join(', ')}]${this.reset}`;
      } else if (typeof text === 'object') {
        // If the text is an object, convert it to a JSON string
        result += `${this.backgrounds[bgColor]}${this.textColors[textColor]}${JSON.stringify(text, null, 2)}${this.reset}`;
      } else {
        // If the text is not an array or object, add it as is
        result += `${this.backgrounds[bgColor]}${this.textColors[textColor]}${text}${this.reset}`;
      }
    });

    result += '\n'; // Add a newline character at the end

    process.stdout.write(result);
  }

  static WB(...texts) { this.log('W', 'B', ...texts); }
  static WG(...texts) { this.log('W', 'G', ...texts); }
  static WR(...texts) { this.log('W', 'R', ...texts); }
  static WY(...texts) { this.log('W', 'Y', ...texts); }
  static GB(...texts) { this.log('G', 'B', ...texts); }
  static GW(...texts) { this.log('G', 'W', ...texts); }
  static GR(...texts) { this.log('G', 'R', ...texts); }
  static GY(...texts) { this.log('G', 'Y', ...texts); }
  static RB(...texts) { this.log('R', 'B', ...texts); }
  static RW(...texts) { this.log('R', 'W', ...texts); }
  static RG(...texts) { this.log('R', 'G', ...texts); }
  static RY(...texts) { this.log('R', 'Y', ...texts); }
  static BW(...texts) { this.log('B', 'W', ...texts); }
  static BG(...texts) { this.log('B', 'G', ...texts); }
  static BY(...texts) { this.log('B', 'Y', ...texts); }
  static YB(...texts) { this.log('Y', 'B', ...texts); }
  static YW(...texts) { this.log('Y', 'W', ...texts); }
  static YG(...texts) { this.log('Y', 'G', ...texts); }
  static YR(...texts) { this.log('Y', 'R', ...texts); }
}

module.exports = ColorLog;