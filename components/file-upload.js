const FileUpload = (() => {

  let pendingFile = null;

  const ALLOWED = {
    'application/pdf':                         { label:'PDF',   icon:'📄', pill:'pill-red'    },
    'video/mp4':                               { label:'Video', icon:'🎥', pill:'pill-accent'  },
    'video/webm':                              { label:'Video', icon:'🎥', pill:'pill-accent'  },
    'application/vnd.ms-powerpoint':           { label:'Slides',icon:'📑', pill:'pill-yellow'  },
    'application/vnd.openxmlformats-officedocument.presentationml.presentation':
                                               { label:'Slides',icon:'📑', pill:'pill-yellow'  },
    'application/msword':                      { label:'Doc',   icon:'📝', pill:'pill-blue'    },
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
                                               { label:'Doc',   icon:'📝', pill:'pill-blue'    },
    'application/zip':                         { label:'ZIP',   icon:'🗜️', pill:'pill-purple'  },
    'text/plain':                              { label:'Text',  icon:'📄', pill:'pill-blue'    },
  };

  function renderZone(containerId, onUploaded) {
    const el = document.getElementById(containerId);
    if (!el) return;
    el.innerHTML = `
      <div class="upload-zone" id="uz-${containerId}"
           ondragover="event.preventDefault();this.style.borderColor='var(--accent)'"
           ondragleave="this.style.borderColor=''"
           ondrop="FileUpload._drop(event,'${containerId}',arguments)">
        <div class="upload-icon">☁️</div>
        <p>Drag & drop your file here or <span style="color:var(--accent);cursor:pointer" onclick="document.getElementById('fi-${containerId}').click()">browse</span></p>
        <p style="margin-top:6px;font-size:.78rem;opacity:.6">PDF · PPT · MP4 · DOC · ZIP · TXT — max 50 MB</p>
        <input type="file" id="fi-${containerId}" style="display:none"
               accept=".pdf,.ppt,.pptx,.mp4,.webm,.doc,.docx,.zip,.txt"
               onchange="FileUpload._fileSelected(event,'${containerId}')">
      </div>
      <div id="up-preview-${containerId}" style="display:none;margin-top:12px"></div>`;

    FileUpload._callbacks = FileUpload._callbacks || {};
    FileUpload._callbacks[containerId] = onUploaded;
  }

  function _drop(event, cid) {
    event.preventDefault();
    document.getElementById(`uz-${cid}`).style.borderColor = '';
    const file = event.dataTransfer.files[0];
    if (file) _process(file, cid);
  }

  function _fileSelected(event, cid) {
    const file = event.target.files[0];
    if (file) _process(file, cid);
  }

  function _process(file, cid) {
    if (file.size > 50 * 1024 * 1024) {
      Utils.toast('File exceeds 50 MB limit', 'error');
      return;
    }
    pendingFile = file;
    const meta  = ALLOWED[file.type] || { label: 'File', icon: '📁', pill: 'pill-accent' };
    const sizeMB = (file.size / (1024 * 1024)).toFixed(2);

    const preview = document.getElementById(`up-preview-${cid}`);
    preview.style.display = 'block';
    preview.innerHTML = `
      <div class="material-item" style="background:var(--bg3)">
        <div class="material-icon" style="background:rgba(108,99,255,.15)">${meta.icon}</div>
        <div class="material-info">
          <div class="material-name">${file.name}</div>
          <div class="material-meta"><span class="pill ${meta.pill}">${meta.label}</span> ${sizeMB} MB</div>
        </div>
        <div style="color:var(--green);font-size:1.2rem">✓</div>
      </div>`;

    if (FileUpload._callbacks?.[cid]) {
      FileUpload._callbacks[cid]({
        file,
        name:  file.name,
        type:  meta.label,
        icon:  meta.icon,
        pill:  meta.pill,
        size:  sizeMB + ' MB',
      });
    }
  }

  return { renderZone, _drop, _fileSelected, _process };
})();
