import { readdirSync, statSync, mkdirSync, existsSync, writeFileSync } from "fs";
import { join, resolve, basename } from "path";
let sharp = require("sharp")
let potrace = require("potrace")


const conf = {
  srcPath: join(__dirname, "img"),
  destDirName: "svg",
  baseImgName: "base.png",
}


function walkPathAndProcessImages({srcPath, destDirName, baseImgName}) {
  srcPath = resolve(srcPath);
  let paths = [];

  readdirSync(srcPath).forEach(subDir => {
    subDir = join(srcPath, subDir);

    if (statSync(subDir).isDirectory()) {
      let baseImagePath = join(subDir, baseImgName);

      if (statSync(baseImagePath).isFile()) {
        let destDir = join(subDir, destDirName);
        existsSync(destDir) || mkdirSync(destDir);

        readdirSync(subDir).forEach(imagePath => {
          imagePath = join(subDir, imagePath);
          if (statSync(imagePath).isFile() && imagePath !== baseImagePath) {
            processImage(baseImagePath, imagePath, destDir);
          }
        });
      } else {
        console.log(`Base image ${baseImgName} not found in ${subDir}, skip...`)
      }
    }
  });
}

function processImage(baseImgPath, layerImgPath, outputDir) {
  const name = basename(layerImgPath);
  const mergedImagePath = join(outputDir, name)
  const svgPath = join(outputDir, name.replace(".png", ".svg"))

  sharp(baseImgPath)
    .flatten( { background: '#ff6600' } )
    .composite([{ input: 'overlay.png', gravity: 'southeast' }])
    // .grayscale()
      //  .png()
       .toFile(mergedImagePath);

  potrace.trace(mergedImagePath, function(err, svg) {
    if (err) throw err;
    writeFileSync(svgPath, svg);
  });
}

walkPathAndProcessImages(conf);
