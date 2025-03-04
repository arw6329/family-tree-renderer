import { NodeMetadata } from "@/lib/family-tree/FamilyTreeDatabase"
import "./MetadataFrame.scoped.css"
import { range } from "@/lib/range"

const metadata: NodeMetadata[] = [
    {
      "type": "simple",
      "key": "NAME",
      "value": "Barack Hussein Obama II",
      "children": [
        {
          "type": "pointer",
          "pointer": "c95d3b73-65d9-4c0d-a8dd-b448cbce09da",
          "children": [
            {
              "type": "simple",
              "key": "PAGE",
              "value": "Gale Research Company; Detroit, Michigan; Accession Number: 922392",
              "children": []
            },
            {
              "type": "simple",
              "key": "DATA",
              "value": null,
              "children": [
                {
                  "type": "simple",
                  "key": "TEXT",
                  "value": "Record for Dr. Barack Hussein Obama",
                  "children": []
                }
              ]
            },
            {
              "type": "simple",
              "key": "LINK",
              "value": "https://search.ancestry.com/cgi-bin/sse.dll?db=4394&h=10717780&indiv=try",
              "children": []
            }
          ]
        }
      ]
    },
    {
      "type": "simple",
      "key": "GENDER",
      "value": "Male",
      "children": []
    },
    {
      "type": "simple",
      "key": "BIRTH",
      "value": null,
      "children": [
        {
          "type": "simple",
          "key": "DATE",
          "value": {
            "type": "date",
            "date": {
              "year": 1961,
              "month": 7,
              "day": 4,
              "bce": false
            }
          },
          "children": []
        },
        {
          "type": "simple",
          "key": "PLACE",
          "value": "Honolulu, Honolulu, Hawaii, USA",
          "children": [
            {
              "type": "simple",
              "key": "COORDINATES",
              "value": "N21.3069 W157.8583",
              "children": []
            }
          ]
        },
        {
          "type": "pointer",
          "pointer": "c95d3b73-65d9-4c0d-a8dd-b448cbce09da",
          "children": [
            {
              "type": "simple",
              "key": "PAGE",
              "value": "Gale Research Company; Detroit, Michigan; Accession Number: 922392",
              "children": []
            },
            {
              "type": "simple",
              "key": "DATA",
              "value": null,
              "children": [
                {
                  "type": "simple",
                  "key": "TEXT",
                  "value": "Record for Dr. Barack Hussein Obama",
                  "children": []
                }
              ]
            },
            {
              "type": "simple",
              "key": "LINK",
              "value": "https://search.ancestry.com/cgi-bin/sse.dll?db=4394&h=10717780&indiv=try",
              "children": []
            }
          ]
        }
      ]
    },
    {
      "type": "simple",
      "key": "OCCUPATION",
      "value": "US President No. 44, Democratic",
      "children": [
        {
          "type": "simple",
          "key": "DATE",
          "value": {
            "type": "date",
            "date": {
              "year": 2009,
              "month": 0,
              "day": 20,
              "bce": false
            }
          },
          "children": []
        },
        {
          "type": "simple",
          "key": "PLACE",
          "value": "Washington, District of Columbia, USA",
          "children": [
            {
              "type": "simple",
              "key": "COORDINATES",
              "value": "N38.895 W77.0367",
              "children": []
            }
          ]
        }
      ]
    },
    {
      "type": "simple",
      "key": "PRIMARY_PHOTO",
      "value": null,
      "children": [
        {
          "type": "simple",
          "key": "FILE",
          "value": "C:\\FTM\\US_Presidents_2020 Media\\Photo_Barack_Obama.jpg",
          "children": [
            {
              "type": "simple",
              "key": "FORMAT",
              "value": "jpg",
              "children": []
            },
            {
              "type": "simple",
              "key": "TITLE",
              "value": "Barack Obama",
              "children": []
            },
            {
              "type": "simple",
              "key": "DATE",
              "value": {
                "type": "plaintext",
                "text": "12/6/2012"
              },
              "children": []
            },
            {
              "type": "simple",
              "key": "NOTE",
              "value": "Photo from Wikimedia Foundation  President Barack Obama in the Oval Office, Dec. 6, 2012.  (Official White House Photo by Pete Souza)",
              "children": []
            }
          ]
        }
      ]
    },
    {
      "type": "simple",
      "key": "OBJECT",
      "value": null,
      "children": [
        {
          "type": "simple",
          "key": "FILE",
          "value": "C:\\FTM\\US_Presidents_2020 Media\\Photo_Barack_Obama.jpg",
          "children": [
            {
              "type": "simple",
              "key": "FORMAT",
              "value": "jpg",
              "children": []
            },
            {
              "type": "simple",
              "key": "TITLE",
              "value": "Barack Obama",
              "children": []
            },
            {
              "type": "simple",
              "key": "DATE",
              "value": {
                "type": "plaintext",
                "text": "12/6/2012"
              },
              "children": []
            },
            {
              "type": "simple",
              "key": "NOTE",
              "value": "Photo from Wikimedia Foundation  President Barack Obama in the Oval Office, Dec. 6, 2012.  (Official White House Photo by Pete Souza)",
              "children": []
            }
          ]
        }
      ]
    }
  ]

function row(record: NodeMetadata, depth: number) {
    return (
        <div className="kv-table-row">
            {range(1, depth).map(() => <div className="depth-marker" />)}
            <div className="label-value-wrapper">
                <label>{record.key}</label>
                <span>{record.value}</span>
            </div>
        </div>
    )
}

function block(record: NodeMetadata, depth: number) {
    const dereffedRecord = record.type === 'pointer' ? {
        type: 'simple' as const,
        key: '<pointerized>',
        value: '<pointerized>',
        children: record.children
    } : {
        type: record.type,
        key: record.key,
        value: record.value?.toString() ?? null,
        children: record.children
    }

    if(dereffedRecord.children.length) {
        return (
            <details className="kv-block">
                <summary>{row(dereffedRecord, depth)}</summary>
                <div className="content">
                    {record.children.map(child => block(child, depth + 1))}
                </div>
            </details>
        )
    } else {
        return row(dereffedRecord, depth)
    }
}

const MetadataFrame: React.FC<{}> = ({}) => {
    return (
        <div className="root">
            {metadata.map(record => block(record, 0))}
        </div>
    )
}

export default MetadataFrame
