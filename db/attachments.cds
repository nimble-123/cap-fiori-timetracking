using {io.nimble as db} from './data-model';
using {Attachments} from '@cap-js/attachments';

extend entity db.TimeEntries with {
  attachments : Composition of many Attachments;
}
