import * as React from 'react'

interface Props {
    /** The field title */
    title: string
    /** An example displaying the shortcut for this field. */
    shortcut: string
    /** An optional example for sourcegraph.com that displays the shortcut for this field. */
    dotComShortcut?: string
    /** An optional tip shown when hovering over the shortcut. */
    tip?: string
    /**
     * An appropriate identifier for this field to be used as a suffix for CSS classes and testing IDs.
     * Must be a single or hyphenated word, and unique amongst the other fields in the query builder.
     */
    shortName: string
    /** Handler for when an input field changes. */
    onInputChange: (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void
    isSourcegraphDotCom: boolean
}

export class QueryBuilderInputRow extends React.Component<Props, {}> {
    public render(): JSX.Element | null {
        return (
            <div className="query-builder__row">
                <label className="query-builder__row-label" htmlFor={`query-builder__${this.props.shortName}`}>
                    {this.props.title}:
                </label>
                <div className="query-builder__row-input">
                    <input
                        data-testid={`test-${this.props.shortName}`}
                        id={`query-builder__${this.props.shortName}`}
                        className="form-control query-builder__input"
                        spellCheck={false}
                        autoCapitalize="off"
                        placeholder=""
                        onChange={this.props.onInputChange}
                    />
                </div>
                <div className="query-builder__row-example" title={this.props.tip}>
                    {this.props.dotComShortcut
                        ? this.props.isSourcegraphDotCom
                            ? this.props.dotComShortcut
                            : this.props.shortcut
                        : this.props.shortcut}
                </div>
            </div>
        )
    }
}
