import { Pickle, GherkinDocument, Location } from '@cucumber/messages';

export type GherkinDocumentWithPickles = GherkinDocument & {
  pickles: PickleWithLocation[];
};

export type PickleWithLocation = Pickle & {
  location: Location;
};
