import { useSelector } from "react-redux";
import GroupIcon from "../../assets/image/group-icon.png";

function DialogList({
  searchResults,
  selectedDialog,
  handleDialogClick,
  searchText,
  handleSearch,
  formatTimestamp,
  getStatusColor,
  handleCreateGroup,
}) {
  const updatedResults = [...searchResults, {}];

  const user = useSelector((state) => state.user);

  return (
    <div className="col-md-4">
      <div className="card">
        <div className="card-header">
          <input
            type="text"
            className="form-control mb-3"
            placeholder="Поиск"
            value={searchText}
            onChange={handleSearch}
          />
        </div>
        <div className="card-body">
          <ul className="list-group">
            {updatedResults?.map((result, id) => {
              if (Object.keys(result).length !== 0) {
                return (
                  <li
                    key={id}
                    className={`list-group-item ${
                      result === selectedDialog ? "active" : ""
                    }`}
                    onClick={() => handleDialogClick(result)}
                  >
                    <div className="dialog-info">
                      <div className="avatar-block">
                        <img
                          src={result?.avatarURL || user.defaultAvatar}
                          alt={result?.login}
                          className="avatar"
                        />
                        {result?.type !== "group" ? (
                          <div
                            className="status-circle"
                            style={{
                              backgroundColor: getStatusColor(result?.isOnline),
                            }}
                          ></div>
                        ) : (
                          <div className="chat-type">
                            <img alt={result?.type} src={GroupIcon} />
                          </div>
                        )}
                      </div>
                      <div className="dialog-text">
                        <div className="name-time">
                          {result && result.login !== undefined
                            ? result.login.length > 9
                              ? `${result.login.slice(0, 9)}...`
                              : result.login
                            : null}
                          <span className="message-timestamp text-muted">
                            {result &&
                            result.messages &&
                            result.messages.length > 0 &&
                            result.messages[result.messages.length - 1] &&
                            result.messages[result.messages.length - 1]
                              .timestamp !== undefined
                              ? formatTimestamp(
                                  result.messages[result.messages.length - 1]
                                    .timestamp
                                )
                              : null}
                          </span>
                        </div>

                        <div className="message-text">
                          {result &&
                          result.messages &&
                          result.messages.length > 0 &&
                          result.messages[result.messages.length - 1] &&
                          result.messages[result.messages.length - 1].text ===
                            null
                            ? result.messages[result.messages.length - 1]
                                ?.is_doc === 1
                              ? "DOCUMENT"
                              : result.messages[result.messages.length - 1]
                                  ?.isDoc === 1
                              ? "DOCUMENT"
                              : result.messages[result.messages.length - 1]
                                  ?.text?.length > 30
                              ? `${result.messages[
                                  result.messages.length - 1
                                ]?.text?.slice(0, 30)}...`
                              : ""
                            : result.messages[result.messages.length - 1]?.text
                                ?.length > 30
                            ? `${result.messages[
                                result.messages.length - 1
                              ]?.text?.slice(0, 30)}...`
                            : result.messages[result.messages.length - 1]?.text}
                          {selectedDialog?.type !== "group" ? (
                            result &&
                            result.messages &&
                            result.messages.length > 0 ? (
                              result.type !== "group" ? (
                                <div className="message-status">
                                  <i
                                    className={`message-status_wrapper ${
                                      result.messages[
                                        result.messages.length - 1
                                      ].is_read === 1
                                        ? "message-status_true"
                                        : "message-status_false"
                                    }`}
                                  >
                                    &#10004;
                                  </i>
                                </div>
                              ) : null
                            ) : null
                          ) : null}
                        </div>
                      </div>
                    </div>
                  </li>
                );
              } else {
                if (updatedResults.length > 5) {
                  return (
                    <li key={id} className={`list-group-item`}>
                      stub
                    </li>
                  );
                }
              }
            })}
          </ul>
        </div>
        <div className="create-group">
          <li className="list-group-item" onClick={() => handleCreateGroup()}>
            Создать группу
          </li>
        </div>
      </div>
    </div>
  );
}

export default DialogList;
