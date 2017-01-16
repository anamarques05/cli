/* eslint no-console: 0 */
import path from 'path';
import _ from 'lodash';
import inquirer from 'inquirer';
import mzfs from 'mz/fs';
import { instantiateTemplatePath } from '../extension/template';
import { ensureDeveloperIsRegistered } from './register';
import * as yarn from '../extension/yarn';
import msg from '../user_messages';


export function cwd() {
  return process.cwd();
}

export async function promptExtensionInit(extName) {
  /* eslint no-confusing-arrow: 0 */
  /* eslint no-param-reassign: 0 */
  const name = _.kebabCase(extName);
  const title = _.upperFirst(extName.toLowerCase());
  const version = '0.0.1';

  const questions = [{
    name: 'title',
    message: 'Title',
    default: title,
  }, {
    name: 'version',
    message: 'Version',
    default: version,
    validate: value => value.match(/^(\d+)\.(\d+)\.(\d+)+$/)
                        ? true
                        : 'Version must contain numbers in format X.Y.Z',
  }, {
    name: 'description',
    message: 'Description',
  }];

  console.log(msg.init.requestInfo());

  const answer = await inquirer.prompt(questions);

  return {
    name,
    title: answer.title,
    version: answer.version,
    description: answer.description,
  };
}

async function ensureWorkingDirIsEmpty() {
  const files = await mzfs.readdir(cwd());

  if (files.length !== 0) {
    throw new Error(msg.init.nonEmpty());
  }
}

export async function initExtension(extName) {
  await ensureWorkingDirIsEmpty();
  await yarn.ensureYarnInstalled();
  const developer = await ensureDeveloperIsRegistered();
  const extJson = await promptExtensionInit(extName);
  await instantiateTemplatePath('init', cwd(), {devName: developer.name, extJson});
  await yarn.install(path.join(cwd(), 'server'));
  await yarn.install(path.join(cwd(), 'app'));
}