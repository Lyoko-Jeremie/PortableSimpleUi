export const DEFAULT_THEME_CSS = `
.ps-shadow-root {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  color: #333;
}
.ps-shadow-root .ps-button, .ps-root .ps-button {
  background: #007bff;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.2s, box-shadow 0.2s;
  font-family: inherit;
  font-size: 14px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  outline: none;
}
.ps-shadow-root .ps-button:hover, .ps-root .ps-button:hover {
  background: #0056b3;
}
.ps-shadow-root .ps-button:active, .ps-root .ps-button:active {
  background: #004085;
}
.ps-shadow-root .ps-button:disabled, .ps-root .ps-button:disabled {
  background: #ccc;
  cursor: not-allowed;
  color: #666;
}
.ps-shadow-root .ps-input, .ps-root .ps-input, .ps-shadow-root .ps-select, .ps-root .ps-select {
  border: 1px solid #ccc;
  border-radius: 4px;
  padding: 6px 12px;
  font-size: 14px;
  outline: none;
  font-family: inherit;
  transition: border-color 0.2s;
}
.ps-shadow-root .ps-input:focus, .ps-root .ps-input:focus, .ps-shadow-root .ps-select:focus, .ps-root .ps-select:focus {
  border-color: #007bff;
}
.ps-shadow-root .ps-label, .ps-root .ps-label {
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 4px;
  display: inline-block;
}
.ps-shadow-root .ps-text, .ps-root .ps-text {
  font-size: 14px;
}
.ps-shadow-root .ps-checkbox, .ps-root .ps-checkbox, .ps-shadow-root .ps-radio, .ps-root .ps-radio {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 14px;
}
.ps-shadow-root .ps-checkbox input, .ps-root .ps-checkbox input, .ps-shadow-root .ps-radio input, .ps-root .ps-radio input {
  cursor: pointer;
}
.ps-shadow-root .ps-progress-bar, .ps-root .ps-progress-bar {
  background-color: #eee;
  border-radius: 5px;
  overflow: hidden;
  height: 10px;
}
.ps-shadow-root .ps-progress-bar > div, .ps-root .ps-progress-bar > div {
  height: 100%;
  background-color: #4caf50;
  transition: width 0.2s;
}
.ps-shadow-root .ps-group, .ps-root .ps-group {
  border: 1px solid #ccc;
  border-radius: 4px;
  padding: 10px;
  margin: 10px 0;
}
.ps-shadow-root .ps-group legend, .ps-root .ps-group legend {
  font-weight: bold;
  padding: 0 5px;
}
.ps-shadow-root .psu-tabs, .ps-root .psu-tabs {
  display: flex;
  flex-direction: column;
}
.ps-shadow-root .psu-tabs-header, .ps-root .psu-tabs-header {
  display: flex;
  border-bottom: 1px solid #ddd;
  margin-bottom: 15px;
}
.ps-shadow-root .psu-tabs-item, .ps-root .psu-tabs-item {
  padding: 10px 20px;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  transition: all 0.2s;
}
.ps-shadow-root .psu-tabs-item:hover, .ps-root .psu-tabs-item:hover {
  color: #007bff;
}
.ps-shadow-root .psu-tabs-item.active, .ps-root .psu-tabs-item.active {
  color: #007bff;
  border-bottom-color: #007bff;
  font-weight: bold;
}
.ps-shadow-root .psu-tabs-body, .ps-root .psu-tabs-body {
  padding: 10px 0;
}

/* Modal */
.ps-shadow-root .ps-modal-overlay, .ps-root .ps-modal-overlay {
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(0, 0, 0, 0.5) !important;
}
.ps-shadow-root .ps-modal-content, .ps-root .ps-modal-content {
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  min-width: 300px;
  max-width: 80vw;
  overflow: hidden;
}
.ps-shadow-root .ps-modal-header, .ps-root .ps-modal-header {
  padding: 16px 20px;
  border-bottom: 1px solid #eee;
  font-weight: bold;
  font-size: 16px;
}
.ps-shadow-root .ps-modal-body, .ps-root .ps-modal-body {
  padding: 20px;
}

/* Card */
.ps-shadow-root .ps-card, .ps-root .ps-card {
  background: white;
  border: 1px solid #eee !important;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  overflow: hidden;
}
.ps-shadow-root .ps-card-header, .ps-root .ps-card-header {
  padding: 12px 16px;
  border-bottom: 1px solid #eee;
  font-weight: bold;
}
.ps-shadow-root .ps-card-body, .ps-root .ps-card-body {
  padding: 16px;
}

/* Alert */
.ps-shadow-root .ps-alert, .ps-root .ps-alert {
  padding: 12px 16px;
  border-radius: 4px;
  margin-bottom: 16px;
  border: 1px solid transparent;
}
.ps-shadow-root .ps-alert-info, .ps-root .ps-alert-info {
  background-color: #e6f7ff;
  border-color: #91d5ff;
  color: #004085;
}
.ps-shadow-root .ps-alert-success, .ps-root .ps-alert-success {
  background-color: #f6ffed;
  border-color: #b7eb8f;
  color: #155724;
}
.ps-shadow-root .ps-alert-warning, .ps-root .ps-alert-warning {
  background-color: #fffbe6;
  border-color: #ffe58f;
  color: #856404;
}
.ps-shadow-root .ps-alert-error, .ps-root .ps-alert-error {
  background-color: #fff1f0;
  border-color: #ffa39e;
  color: #721c24;
}

/* Badge */
.ps-shadow-root .ps-badge, .ps-root .ps-badge {
  display: inline-block;
  padding: 2px 8px;
  font-size: 12px;
  border-radius: 10px;
  color: white;
  font-weight: bold;
}

/* Avatar */
.ps-shadow-root .ps-avatar, .ps-root .ps-avatar {
  display: inline-block;
  overflow: hidden;
  border-radius: 50%;
  background: #ccc;
}

/* Table */
.ps-shadow-root .ps-table, .ps-root .ps-table {
  width: 100%;
  border-collapse: collapse;
}
.ps-shadow-root .ps-table th, .ps-root .ps-table th,
.ps-shadow-root .ps-table td, .ps-root .ps-table td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #eee;
}
.ps-shadow-root .ps-table th, .ps-root .ps-table th {
  background-color: #fafafa;
  font-weight: 500;
}

/* List */
.ps-shadow-root .ps-list, .ps-root .ps-list {
  list-style: none;
  padding: 0;
  margin: 0;
}
.ps-shadow-root .ps-list-item, .ps-root .ps-list-item {
  padding: 10px 16px;
  border-bottom: 1px solid #eee;
}
.ps-shadow-root .ps-list-item:last-child, .ps-root .ps-list-item:last-child {
  border-bottom: none;
}
/* 全局样式支持 (当 mode 为 none 时) */
.ps-root {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  color: #333;
}
`;
