import { readdirSync, statSync, mkdirSync, existsSync, writeFileSync, unlinkSync } from "fs";
import { join, resolve, basename } from "path";
const images = require("images");

let sharp = require("sharp")
let potrace = require("potrace")


const conf = {
  srcPath: join(__dirname, "img"),
  destDirName: "svg",
  baseImgName: "base.png",
}


function walkPathAndProcessImages({srcPath, destDirName, baseImgName}) {
  srcPath = resolve(srcPath);

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
  const _mergedImagePath = join(outputDir, "_" + name)
  const mergedImagePath = join(outputDir, name)
  const svgPath = join(outputDir, name.replace(".png", ".svg"))

  console.log(baseImgPath, layerImgPath, outputDir)

  images(baseImgPath).draw(images(layerImgPath), 0, 0).save(_mergedImagePath)

  sharp(_mergedImagePath)
    .modulate({
      brightness: 0,
      saturation: 0
    })
    .toFile(mergedImagePath).then(() => {
      potrace.trace(mergedImagePath, function(err, svg) {
        if (err) throw err;
    
        writeFileSync(svgPath, svg);
      });
    }).then(() => {
      unlinkSync(_mergedImagePath);
      unlinkSync(mergedImagePath);
    });
}

walkPathAndProcessImages(conf);

