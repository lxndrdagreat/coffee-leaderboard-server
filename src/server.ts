import * as express from 'express';
import * as config from './config/config';
import { UnthinkExpressGenerator } from '@epandco/unthink-foundation-express';
import { UnthinkGenerator } from '@epandco/unthink-foundation';
import resourceDefinitions from './resource-definitions';

const app: express.Application = express();

const expressGen = new UnthinkExpressGenerator(
  app,
  (): string => '',
  config.logLevel
);
const unthinkGen = new UnthinkGenerator(expressGen);

resourceDefinitions.forEach((rd) => unthinkGen.add(rd));

unthinkGen.printRouteTable();
unthinkGen.generate();

app.listen(config.expressServerPort);
