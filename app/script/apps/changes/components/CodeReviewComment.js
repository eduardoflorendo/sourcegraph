var React = require("react");
var ReactDOM = require("react-dom");
var CurrentUser = require("../../../CurrentUser");
var moment = require("moment");
var $ = require("jquery");
var CommentModel = require("../../../stores/models/CommentModel");
var MarkdownTextarea = require("../../../components/MarkdownTextarea");
var MarkdownView = require("../../../components/MarkdownView");

var CodeReviewComment = React.createClass({

	propTypes: {
		onCancel: React.PropTypes.func,
		onSubmit: React.PropTypes.func,
		onDelete: React.PropTypes.func,
		onEdit: React.PropTypes.func,
		draftForm: React.PropTypes.bool,
		comment: React.PropTypes.instanceOf(CommentModel),
	},

	getInitialState() {
		return this.props.comment ? this.props.comment.attributes : {};
	},

	componentDidMount() {
		if (this.props.comment) {
			this.props.comment.on("change", this._updateState, this);
			this.props.comment.__node = $(ReactDOM.findDOMNode(this));
		}
	},

	componentWillUnmount() {
		if (this.props.comment) {
			this.props.comment.off("change", this._updateState, this);
		}
	},

	_updateState() {
		this.setState(this.props.comment.attributes);
	},

	/**
	 * @description Triggered when a comment is edited and submitted.
	 * @param {Event} e - Event
	 * @returns {undefined} If unmounted, function returns prematurely.
	 * @private
	 */
	_onEdit(e) {
		e.preventDefault();
		if (!ReactDOM.findDOMNode(this)) return;
		if (typeof this.props.onEdit === "function") {
			this.props.onEdit(this.refs.commentEdit.value(), e);
		}
	},

	/**
	 * @description Called when the edit button is pressed on an exisiting comment.
	 * @param {Event} e - Event
	 * @returns {void}
	 * @private
	 */
	_onEditRequest(e) {
		this.props.comment.set({editingComment: true});
		e.preventDefault();
	},

	/**
	 * @description Called when editing a comment is cancelled.
	 * @param {Event} e - Event
	 * @returns {void}
	 * @private
	 */
	_onEditCancel(e) {
		this.props.comment.set({editingComment: false});
		e.preventDefault();
	},

	/**
	 * @description Called when the delete button is pressed on an exisiting comment.
	 * @param {Event} e - Event
	 * @returns {void}
	 * @private
	 */
	_onDeleteRequest(e) {
		if (typeof this.props.onDelete === "function") {
			this.props.onDelete(e);
		}
		e.preventDefault();
	},

	/**
	 * @description Triggered when a comment is submitted using the draft form.
	 * @param {Event} e - Event
	 * @returns {void}
	 * @private
	 */
	_onSubmit(e) {
		if (!this.isMounted()) return;
		var body = this.refs.draftEdit.value();

		if (typeof this.props.onSubmit === "function") {
			this.props.onSubmit(body, e);
		}
		e.preventDefault();
	},

	render() {
		if (this.props.draftForm) {
			return (
				<div className="inline-content inline-comment">
					<MarkdownTextarea ref="draftEdit" placeholder="Leave a comment..." autoFocus={true} />
					<div className="actions">
						<button className="btn btn-success btn-small" onClick={this._onSubmit} tabIndex="0">Save draft</button>
						<button className="btn btn-default btn-small" onClick={this.props.onCancel} tabIndex="0">Cancel</button>
					</div>
				</div>
			);
		}

		var author = CurrentUser ? CurrentUser.Login : "Anonymous";
		var parent = this.state.parent;

		if (parent) {
			var reviewAuthor = parent.Author;
			if (reviewAuthor) author = reviewAuthor.Login;
		}

		return (
			<div className="inline-content inline-comment">
				<b>{author}</b> commented <span className="date">{moment(this.state.CreatedAt).fromNow()}</span>
				{this.state.Draft ? <span><span className="label-draft">draft</span> <i data-tooltip={true} title="Comment drafts must be submitted using the 'Submit your review' button'" className="draft-help fa fa-question-circle"></i></span> : null}

				{this.state.editingComment ? (
					<div className="comment-edit-wrapper">
						<MarkdownTextarea ref="commentEdit" defaultValue={this.state.Body} autoFocus={true} />
						<div className="actions">
							<button className="btn btn-success" onClick={this._onEdit} tabIndex="0">Save</button>
							<button className="btn btn-default" onClick={this._onEditCancel} tabIndex="0">Cancel</button>
						</div>
					</div>
				) : (
					<div className="comment-body-wrapper">
						<div className="comment-body">
							<MarkdownView content={this.state.Body} />
						</div>

						{this.state.Draft ? (
							<div className="comment-actions">
								<a title="Edit" onClick={this._onEditRequest}>
									<span className="octicon octicon-pencil"></span>
								</a>
								<a title="Delete" onClick={this._onDeleteRequest}>
									<span className="octicon octicon-trashcan"></span>
								</a>
							</div>
						) : null}
					</div>
				)}
			</div>
		);
	},
});

module.exports = CodeReviewComment;
