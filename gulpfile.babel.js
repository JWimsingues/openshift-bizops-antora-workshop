/*jshint esversion: 6 */

import { series, watch } from "gulp";
import { remove } from "fs-extra";
import { readFileSync } from "fs";
import { load as yamlLoad } from "yaml-js";
import generator from "@antora/site-generator-default";
import browserSync from "browser-sync";

const filename = "dev-site.yml";
const server = browserSync.create();
const args = ["--playbook", filename];

function watchGlobs() {
  let json_content = readFileSync(`${__dirname}/${filename}`, "UTF-8");
  let yaml_content = yamlLoad(json_content);
  let dirs = yaml_content.content.sources.map(source => [
    `**/*.yml`,
    `**/*.adoc`,
    `**/*.hbs`
  ]);
  dirs.push([`${filename}`]);
  dirs = [].concat(...dirs);
  return dirs;
}

const siteWatch = () => watch(watchGlobs(), series(build, reload));

function build(done) {
  removeSync();
  generator(args, process.env)
    .then(() => {
      done();
    })
    .catch(err => {
      console.log(err);
      done();
    });
}

function workshopSite(done) {
  generator(["--playbook", "site.yml"], process.env)
    .then(() => {
      done();
    })
    .catch(err => {
      console.log(err);
      done();
    });
}

function removeSync(done) {
  remove("gh-pages");
  if (done) done();
}

function reload(done) {
  server.reload();
  done();
}

function serve(done) {
  server.init({
    server: {
      baseDir: "./gh-pages"
    }
  });
  done();
}

const _default = series(build, serve, siteWatch);

export { _default as default, workshopSite };
