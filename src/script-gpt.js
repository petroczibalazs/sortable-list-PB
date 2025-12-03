const getAppListItem = function (skillIndex = 1, skillName = 'Lorem ipsum dolor ..') {
  const templateHTML =
    `<li class="app__item" data-index="${skillIndex}"><span class="app__item-ordinal">${skillIndex}.</span> ${skillName}
      <svg class="app__icon" xmlns="http://www.w3.org/2000/svg"
        fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
      </svg>
    </li>`;

  const templateEl = document.createElement('template');
  templateEl.innerHTML = templateHTML.trim();
  return templateEl.content.firstElementChild;
};

const getAppListInput = function (inputIndex = 1, isDisabled = 'false') {
  // keep disabled attribute semantics consistent
  const state = isDisabled === 'true' ? 'disabled' : 'active';
  const disabledAttr = isDisabled === 'true' ? 'disabled' : '';

  const templateHTML =
    `<li class="app__item app__item--input">
      <input type="text" class="app__input app__input--${state}" placeholder="${inputIndex}. Add Skill" ${disabledAttr}>
      <svg class="app__icon app__icon--drop" xmlns="http://www.w3.org/2000/svg" fill="none"
        viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
      </svg>
    </li>`;

  const templateEl = document.createElement('template');
  templateEl.innerHTML = templateHTML;
  return templateEl.content.firstElementChild;
};

const getDragMarker = function(){
  const templateHTML = `<li class="drag-marker"></li>`;
  const templateEL = document.createElement('template');
  templateEL.innerHTML = templateHTML;
  return templateEL.content.firstElementChild;
}

const getAppBoxWrapper = function(){
  const templateHTML =
  `<div class="app__box-wrapper" aria-hidden="true" style="position:absolute; display:block; z-index:9999;">
     <ul class="app__suggestion-box" role="listbox" style="list-style:none; margin:0; padding:0;"></ul>
   </div>`;
  const template = document.createElement('template');
  template.innerHTML = templateHTML;
  return template.content.firstElementChild;
};

const getSkillItem = function(skillText){
  const templateHTML = `<li class="app__skill-item" role="option" tabindex="-1" style="padding:6px 8px; cursor:pointer;">${skillText}</li>`;
  const template = document.createElement('template');
  template.innerHTML = templateHTML;
  return template.content.firstElementChild;
}

/* ===========================
   App data & drag globals
   =========================== */

const userSkills = ['Javascript', 'ReactJs', 'NextJs'];

// Drag-related variables (kept as in original, with tiny safety guards later)
let dragStartY;
let dragCursorFromTop;
let dragStartItemProps = null;
let dragClosestItemProps = null;
let dragItemsProps = [];
let appListProps = null;
let dragClone = null;
let dragMarker = null;
let isDragging = false;
let aboveOrUnder = '';

/* Helper */
const isNewSkill = function(skill) {
  if (!skill) return false;
  return userSkills.indexOf(skill.trim()) === -1;
};

/* ===========================
   Core app functions
   =========================== */

const handleSkillInput = function (e) {
  const inputEl = e.target;
  const typedSkill = inputEl.value.trim();
  const inputParent = inputEl.parentNode;

  if (!isNewSkill(typedSkill)) {
    inputEl.setAttribute('placeholder', `${typedSkill} is already in your skills!`);
    inputEl.value = '';
    hideAppBoxWrapper(); // dismiss suggestions when duplicate typed
    return;
  }

  // new skill will be appended where the input was
  const nextSkillIndex = userSkills.length + 1;
  const newListItem = getAppListItem(nextSkillIndex, typedSkill);

  inputParent.replaceWith(newListItem);
  userSkills.push(typedSkill);
  updateInputFields(appList);
};

const addNewListItem = function(skillName) {
  if (!skillName) return;

  const nextInputIndex = [...appList.children].findIndex(child =>
    child.classList.contains('app__item--input')
  );

  if (nextInputIndex === -1) return;
  if (!isNewSkill(skillName)) return;

  const nextInputItem = [...appList.children].at(nextInputIndex);
  const newSkillIndex = userSkills.length + 1;

  const newListItem = getAppListItem(newSkillIndex, skillName);
  nextInputItem.replaceWith(newListItem);

  userSkills.push(skillName);
  updateInputFields(appList);
}

const handleSkillDelete = function (e) {
  if (!e.target.closest('.app__icon')) return;

  let clickedItem = e.target;
  while (clickedItem && clickedItem.nodeName !== 'LI') clickedItem = clickedItem.parentNode;
  if (!clickedItem) return;

  if (clickedItem.classList.contains('app__item--input')) return;

  // get skill name and index
  const skillName = clickedItem.textContent.replace(/\d+\.\s*/, '').trim();
  const skillIndex = userSkills.indexOf(skillName);
  if (skillIndex === -1) return; // defensive guard

  userSkills.splice(skillIndex, 1);

  // create new input item (index = userSkills.length + 1)
  const newInputItem = getAppListInput(userSkills.length + 1, 'true');

  // Recompute last non-input list item (safe)
  const nonInputItems = [...appList.children].filter(li => !li.classList.contains('app__item--input'));
  const lastNonInput = nonInputItems.length ? nonInputItems[nonInputItems.length - 1] : null;

  if (lastNonInput && lastNonInput.parentNode === appList) {
    lastNonInput.insertAdjacentElement('afterend', newInputItem);
  } else {
    // fallback: append to end
    appList.appendChild(newInputItem);
  }

  // Remove the actual li in a defensive way
  // Try direct by index first
  const removedItem = appList.children[skillIndex];
  if (removedItem && removedItem.parentNode === appList && !removedItem.classList.contains('app__item--input')) {
    appList.removeChild(removedItem);
  } else {
    // fallback: find by text and remove
    const possible = [...appList.children].find(li => !li.classList.contains('app__item--input') && li.textContent.replace(/\d+\.\s*/, '').trim() === skillName);
    if (possible && possible.parentNode === appList) possible.remove();
  }

  refreshSkillLabels(appList);
  updateInputFields(appList);
};

const updateInputFields = function (appListRef) {
  const inputFields = appListRef.querySelectorAll('.app__input');

  inputFields.forEach((input, index) => {
    if (index === 0) {
      input.removeAttribute('disabled');
      input.classList.remove('app__input--disabled');
      input.classList.add('app__input--active');
      input.value = '';
      input.focus();
    } else {
      input.setAttribute('disabled', true);
      input.classList.remove('app__input--active');
      input.classList.add('app__input--disabled');
    }
  });
};

const renderAppList = function (userSkillsArr, appListRef) {
  const maxLength = 5;
  while (appListRef.firstChild) appListRef.removeChild(appListRef.firstChild);

  for (const [index, skill] of userSkillsArr.entries()) {
    const newItem = getAppListItem(index + 1, skill);
    appListRef.appendChild(newItem);
  }

  const inputsToAdd = Math.max(0, maxLength - userSkillsArr.length);
  for (let i = 0; i < inputsToAdd; i++) {
    appListRef.appendChild(getAppListInput(userSkillsArr.length + i + 1, 'true'));
  }
};

const refreshSkillLabels = function (appListRef) {
  const skillListItems = [...appListRef.children].filter(
    item => !item.classList.contains('app__item--input')
  );

  skillListItems.forEach((item, index) => {
    const ordinalSpan = item.querySelector('.app__item-ordinal');
    if (ordinalSpan) ordinalSpan.textContent = `${index + 1}. `;
  });
};

/* ===========================
   Drag-and-drop logic (original)
   Minimal safety fixes only:
   - add left property to item props (used by clone)
   - ignore mousedown inside suggestion box or input
   =========================== */

const handleDragMouseDown = function(e) {
  // prevent accidental drag when user interacts with suggestion box or inputs
  if (e.target.closest('.app__box-wrapper')) return;
  if (e.target.closest('.app__item--input')) return;

  e.preventDefault();

  // ignore clicking on icons and stop firing the method repeatedly on real (not cloned) LIs
  const icon = e.target.closest('.app__icon');
  if (icon && icon.closest('.app__item') && !icon.classList.contains("clonedItem")) {
    return;
  }

  // ignore clicking on clone and inside input elements
  if (e.target.closest('.clonedItem')) return;
  if (e.target.closest('.app__item--input')) return;

  dragStartY = e.pageY;

  // collect props for non-input skill labels
  const skillLables = [...appList.children].filter(label => !label.classList.contains('app__item--input'));

  dragItemsProps = []; // reset
  skillLables.forEach((skillLable, index) => {
    const rect = skillLable.getBoundingClientRect();
    const top = rect.top + window.scrollY;
    const left = rect.left + window.scrollX; // small fix: capture left for clone positioning
    const height = rect.height;
    const bottom = rect.bottom + window.scrollY;
    const middle = top + (height / 2);

    dragItemsProps.push({
      index,
      top,
      left,
      height,
      bottom,
      middle
    });
  });

  const appRect = appList.getBoundingClientRect();
  appListProps = {
    left: appRect.left + window.scrollX,
    right: appRect.right + window.scrollX,
    top: appRect.top + window.scrollY,
    height: appRect.height,
    bottom: appRect.bottom + window.scrollY
  };

  dragStartItemProps = dragItemsProps.find(labelData => dragStartY > labelData.top && dragStartY <= labelData.bottom) || null;
  if (dragStartItemProps) {
    dragCursorFromTop = dragStartY - dragStartItemProps.top;
  } else {
    // nothing to drag
    dragCursorFromTop = 0;
    return;
  }
};

const handleDragMouseMove = function(e) {
  if (!dragStartItemProps) return;

  const dragMoveY = e.pageY;
  const threshold = 5;

  if (!isDragging && Math.abs(dragStartY - dragMoveY) <= threshold) return;
  isDragging = true;

  // ensure clone exists
  if (!dragClone) {
    const original = appList.children[dragStartItemProps.index];
    if (!original) return;

    dragClone = original.cloneNode(true);
    dragClone.classList.add("clonedItem");

    dragClone.style.width = original.offsetWidth + "px";
    // use left we stored earlier; fall back to appList left
    const leftPos = (typeof dragStartItemProps.left !== 'undefined') ? (dragStartItemProps.left - appListProps.left) : 0;
    dragClone.style.left = leftPos + "px";

    // position absolutely relative to container (we assume CSS positions allow this)
    dragClone.style.position = 'absolute';
    dragClone.style.top = `${dragStartItemProps.top - appListProps.top}px`;

    appList.appendChild(dragClone);
  }

  // ensure dragMarker exists
  if (!dragMarker) {
    dragMarker = getDragMarker();
    appList.appendChild(dragMarker);
  }

  // calculate desired top relative to container
  let newTop = dragMoveY - appListProps.top - dragCursorFromTop;

  // clamp
  const maxTop = appListProps.height - dragStartItemProps.height;
  if (newTop < 0) newTop = 0;
  if (newTop > maxTop) newTop = maxTop;

  dragClone.style.top = `${newTop}px`;

  // find closest item
  const newMiddle = newTop + dragStartItemProps.height / 2;

  let distance = Infinity;
  dragClosestItemProps = null;

  for (let [__, itemProps] of dragItemsProps.entries()) {
    const labelMiddle = itemProps.middle - appListProps.top;
    const diff = Math.abs(labelMiddle - newMiddle);
    if (diff < distance) {
      distance = diff;
      aboveOrUnder = (labelMiddle - newMiddle) < 0 ? 'under' : 'above';
      distance = diff;
      dragClosestItemProps = itemProps;
    }
  }

  let dragMarkerTop = 0;
  if (dragClosestItemProps) {
    if (aboveOrUnder === 'above') {
      dragMarkerTop = dragClosestItemProps.top - appListProps.top - 10;
    } else {
      dragMarkerTop = dragClosestItemProps.top - appListProps.top + dragClosestItemProps.height + 5;
    }
  }

  if (dragMarker) dragMarker.style.top = `${dragMarkerTop}px`;
};

const handleDragMouseUp = function() {
  if (!isDragging) {
    // clear temporary drag state even if not dragging
    dragStartItemProps = null;
    dragItemsProps.length = 0;
    return;
  }

  const moveItem = function(arr, from, to) {
    const item = arr[from];
    arr.splice(from, 1);
    if (to > from) to--;
    arr.splice(to, 0, item);
  };

  if (dragClosestItemProps && dragStartItemProps) {
    const closestItemIndex = dragClosestItemProps.index;
    const dragItemIndex = dragStartItemProps.index;

    // get references safely
    const closestItem = appList.children[closestItemIndex];
    const dragItem = appList.children[dragItemIndex];

    if (closestItem && dragItem) {
      if (aboveOrUnder === 'above') {
        closestItem.insertAdjacentElement('beforebegin', dragItem);
      } else {
        closestItem.insertAdjacentElement('afterend', dragItem);
      }
    }

    // refresh userSkills array
    if (dragItemIndex != closestItemIndex) {
      let fromIndex = dragItemIndex;
      let toIndex = closestItemIndex;
      if (aboveOrUnder === 'under') {
        toIndex++;
      }
      moveItem(userSkills, fromIndex, toIndex);
    }
  }

  dragStartItemProps = null;
  dragItemsProps.length = 0;
  isDragging = false;

  if (dragClone) {
    dragClone.remove();
    dragClone = null;
  }

  if (dragMarker) {
    dragMarker.remove();
    dragMarker = null;
  }

  refreshSkillLabels(appList);
}

/* ===========================
   Suggestion box logic (robust)
   =========================== */

const appBoxWrapper = getAppBoxWrapper();
const skillsBox = appBoxWrapper.querySelector('.app__suggestion-box');

const suggestions = [
  'JavaScript','Python','Java','C#','C++','TypeScript','HTML','CSS',
  'React','Angular','Vue.js','Node.js','Express.js','Django','Flask',
  'SQL','NoSQL','MongoDB','PostgreSQL','Git','Docker','Kubernetes',
  'AWS','Azure','Google Cloud Platform','Linux Administration',
  'Network Security','Machine Learning','Data Analysis','API Development'
];

function positionSuggestionBox(input) {
  const rect = input.getBoundingClientRect();
  const left = rect.left + window.scrollX;
  const top = rect.bottom + window.scrollY;
  appBoxWrapper.style.left = `${left}px`;
  appBoxWrapper.style.top = `${top}px`;
  appBoxWrapper.style.width = `${rect.width}px`;
  appBoxWrapper.style.display = 'block';
  appBoxWrapper.style.zIndex = 9999;
}

function hideAppBoxWrapper() {
  appBoxWrapper.classList.remove('app__box-wrapper--visible');
  appBoxWrapper.style.display = 'none';
  skillsBox.innerHTML = '';
  appBoxWrapper.setAttribute('aria-hidden', 'true');
}

function renderSkillsBox(skillsArr = []) {
  skillsBox.innerHTML = '';
  skillsArr.forEach(skill => skillsBox.appendChild(getSkillItem(skill)));
}

const handleSkillInputTyping = function(e) {
  const input = e.target;
  if (!input.classList.contains("app__input")) return;

  const text = input.value.trim().toLowerCase();
  if (!text) {
    hideAppBoxWrapper();
    return;
  }

  const matching = suggestions.filter(skill =>
    skill.toLowerCase().startsWith(text)
  );

  if (matching.length === 0) {
    hideAppBoxWrapper();
    return;
  }

  renderSkillsBox(matching);
  positionSuggestionBox(input);
  appBoxWrapper.classList.add("app__box-wrapper--visible");
  appBoxWrapper.setAttribute('aria-hidden', 'false');
};

/* ===========================
   Initialization (DOMContentLoaded)
   =========================== */

document.addEventListener('DOMContentLoaded', function() {
  // DOM refs
  window.appList = document.querySelector('.app__list');
  const skillsList = document.querySelector('.skills__list');

  if (!appList) {
    console.error('app__list not found. Ensure the markup exists before this script runs.');
    return;
  }

  // append suggestion box to body to avoid insertion into LIs (prevents index conflicts)
  document.body.appendChild(appBoxWrapper);
  hideAppBoxWrapper();

  // initial render
  renderAppList(userSkills, appList);
  updateInputFields(appList);

  // event bindings
  appList.addEventListener('change', handleSkillInput);
  appList.addEventListener('click', handleSkillDelete);

  // drag event listeners (original ones, re-attached here)
  appList.addEventListener('mousedown', handleDragMouseDown);
  document.addEventListener('mousemove', handleDragMouseMove);
  document.addEventListener('mouseup', handleDragMouseUp);

  // suggestion box interactions
  appList.addEventListener('input', handleSkillInputTyping);

  // clicking on suggestions
  skillsBox.addEventListener('click', function(e) {
    const item = e.target.closest('.app__skill-item');
    if (!item) return;
    const skill = item.textContent.trim();
    addNewListItem(skill);
    hideAppBoxWrapper();
  });

  // close suggestions when clicking outside suggestion box and not focusing input
  document.addEventListener('click', function(e) {
    // if click inside box or inside an input, do nothing
    if (e.target.closest('.app__box-wrapper') || e.target.closest('.app__input')) {
      return;
    }
    hideAppBoxWrapper();
  });

  // when user uses keyboard to focus away, close suggestion box
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') hideAppBoxWrapper();
  });
});