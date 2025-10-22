using AdminService as service from '../../../service-model';

////////////////////////////////////////////////////////////////////////////
//  Action Parameter - Value Helps
////////////////////////////////////////////////////////////////////////////


////////////////////////////////////////////////////////////////////////////
//  Weitere Value Helps
////////////////////////////////////////////////////////////////////////////

// Users - defaultWorkLocation Value Help
annotate service.Users with {
  defaultWorkLocation @(
    Common.ValueList               : {
      CollectionPath: 'WorkLocations',
      Parameters    : [
        {
          $Type            : 'Common.ValueListParameterInOut',
          LocalDataProperty: defaultWorkLocation_code,
          ValueListProperty: 'code'
        },
        {
          $Type            : 'Common.ValueListParameterDisplayOnly',
          ValueListProperty: 'text'
        }
      ]
    },
    Common.ValueListWithFixedValues: true
  )
};
