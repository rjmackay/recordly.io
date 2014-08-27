# recordly.io

[recordly.io](http://recordly.io) is an experiment with recording media streams. It is based largely on [RecordRTC](https://www.webrtc-experiment.com/RecordRTC/) by [Muaz Khan](https://github.com/muaz-khan).

## Installing

1. Get the code `git clone https://github.com/rjmackay/recordly.io.git`
2. Install dependencies, run `npm install` and `bower install`
3. Install ffmpeg with `--with-libvpx --with-theora --with-libogg --with-libvorbis`
3. Build CSS `gulp build`
4. Start the server `foreman start`

Go to [http://localhost:5000](http://localhost:5000) to view the site.

## License

recordly.io is licensed under [GNU Affero GPL](https://github.com/rjmackay/recordly.io/blob/master/LICENSE.md). RecordRTC is licensed under the MIT license.