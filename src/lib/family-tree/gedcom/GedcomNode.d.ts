export type GedcomNode = {
    children: Array<GedcomNode>,
    data: {
        xref_id?: string,
        pointer?: string,
        formal_name: string | undefined
    },
    type: string,
    value: string | undefined
}
