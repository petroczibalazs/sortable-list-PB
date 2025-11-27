/**
 * @param {*} skillIndex
 * @param {*} skillName
 * @returns
 */
const getAppListItem = function (skillIndex = 1, skillName = 'Lorem ipsum dolor ..') {
  const templateHTML =
    `<li class="app__item" data-index="${skillIndex}">${skillIndex}. ${skillName}
      <svg class="app__icon" xmlns="http://www.w3.org/2000/svg"
        fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
      </svg>
    </li>`;

  const templateEl = document.createElement('template');
  templateEl.innerHTML = templateHTML.trim();
  return templateEl.content.firstElementChild;
};


/**
 * @param {*} inputIndex
 * @param {*} isDisabled
 * @returns
 */
const getAppListInput = function (inputIndex = 1, isDisabled = 'false') {
  const state = isDisabled === 'true' ? 'disabled' : 'active';

  const templateHTML =
    `<li class="app__item app__item--input">
      <input type="text" class="app__input app__input--${state}" placeholder="${inputIndex}. Add Skill" disabled="${isDisabled}">
      <svg class="app__icon app__icon--drop" xmlns="http://www.w3.org/2000/svg" fill="none"
        viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
      </svg>
    </li>`;

  const templateEl = document.createElement('template');
  templateEl.innerHTML = templateHTML;
  return templateEl.content.firstElementChild;
};


// User skill array
const userSkills = ['Javascript', 'ReactJs', 'NextJs', 'Rust'];

// Drag-related variables
let dragStartY;
let dragCursorFromTop;
let dragStartItemProps = null;
let dragClosestItemProps = null;
let appListProps = null;
let dragItemsProps = [];
let dragClone = null;
let dragMarker;
let isDragging = false;


// Helpers
const isNewSkill = function (skill) {
  return userSkills.indexOf(skill) === -1;
};


// Add skill from text input
const handleSkillInput = function (e) {
  const inputEl = e.target;
  const parentItem = inputEl.parentNode;

  const nextSkillIndex = userSkills.length + 1;
  const newListItem = getAppListItem(nextSkillIndex, inputEl.value);

  parentItem.replaceWith(newListItem);
  userSkills.push(inputEl.value);

  updateInputFields(appList);
};


// Add skill from suggested list
const handleSuggestedSkillClick = function (e) {
  if (!e.target.closest('.skills__item')) return;

  const nextInputIndex = [...appList.children].findIndex(child =>
    child.classList.contains('app__item--input')
  );

  if (nextInputIndex === -1) return;

  const nextInputItem = [...appList.children].at(nextInputIndex);
  const newSkillIndex = userSkills.length + 1;

  const newSkillName = e.target.textContent.trim().replace(/\s*[+]\s*/, '');
  if (!isNewSkill(newSkillName)) return;

  const newListItem = getAppListItem(newSkillIndex, newSkillName);
  nextInputItem.replaceWith(newListItem);

  userSkills.push(newSkillName);
  updateInputFields(appList);
};


// Enable/disable input fields
const updateInputFields = function (appList) {
  const inputFields = appList.querySelectorAll('.app__input');

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


// Rebuild app list (used at startup)
const renderAppList = function (userSkills, appList) {
  const maxLength = 5;
  const missingCount = Math.abs(maxLength - userSkills.length);

  while (appList.firstChild) appList.removeChild(appList.firstChild);

  for (const [index, skill] of userSkills.entries()) {
    const newItem = getAppListItem(index + 1, skill);
    appList.appendChild(newItem);
  }

  for (let x = maxLength - missingCount; x < maxLength; x++) {
    const newInputItem = getAppListInput(x + 1, true);
    appList.appendChild(newInputItem);
  }
};


// Update the numbering + labels after delete
const refreshSkillLabels = function (appList) {
  const skillListItems = [...appList.children].filter(
    item => !item.classList.contains('app__item--input')
  );

  skillListItems.forEach((item, index) => {
    item.childNodes[0].nodeValue = `${index + 1}. ${userSkills[index]}`;
  });
};


// Delete a skill (from left list)
const handleSkillDelete = function (e) {
  if (!e.target.closest('.app__icon')) return;

  let clickedItem = e.target;
  while (clickedItem.nodeName !== 'LI') clickedItem = clickedItem.parentNode;

  if (clickedItem.classList.contains('app__item--input')) return;

  const skillName = clickedItem.textContent.trim().replace(/\d+\.\s*/, '');
  const skillIndex = userSkills.indexOf(skillName);
  const lastIndex = userSkills.length - 1;

  userSkills.splice(skillIndex, 1);

  const newInputItem = getAppListInput(userSkills.length + 1, 'true');
  const removedItem = appList.children[skillIndex];
  const lastListItem = appList.children[lastIndex];

  lastListItem.insertAdjacentElement('afterend', newInputItem);
  appList.removeChild(removedItem);

  refreshSkillLabels(appList);
  updateInputFields(appList);
};


// Start Drag action
const handleDragMouseDown = function( e ){

  e.preventDefault();

  dragStartItemProps = null;
  if( e.target.closest('.app__icon')) return;
  if( e.target.closest('.app__item--input')) return;

  dragStartY = e.pageY;

  const skillLables = [...appList.children]
  .filter( label => !label.classList.contains('app__item--input'));


  // assigning values to global variables

  skillLables.forEach( ( skillLable, index ) => {

    const {top, height, bottom } = skillLable.getBoundingClientRect();

    dragItemsProps.push(
      {
        index,
        top : top + window.scrollY,
        height,
        bottom : bottom + window.scrollY,
        middle : top + window.scrollY + (height / 2)
      }
    )
  });

  const {left, right, top, bottom, height } = appList.getBoundingClientRect();

  appListProps = {
    left : left + window.scrollX,
    right: right + window.scrollX,
    top: top + window.scrollY,
    height,
    bottom: bottom + window.scrollY
  };


  dragStartItemProps = dragItemsProps
  .find( labelData => dragStartY > labelData.top && dragStartY <= labelData.bottom );


  dragCursorFromTop = dragStartY - dragStartItemProps.top;

};


// Dragging a skill label
const handleDragMouseMove = function(e) {
  if (!dragStartItemProps) return;

  const dragMoveY = e.pageY;
  const threshold = 5;

  if (!isDragging && Math.abs(dragStartY - dragMoveY) <= threshold) return;
  isDragging = true;

  // ensure clone exists
  if (!dragClone) {
    const original = appList.children[dragStartItemProps.index];
    dragClone = original.cloneNode(true);
    dragClone.classList.add("clonedItem");

    dragClone.style.width = original.offsetWidth + "px";
    dragClone.style.left = dragStartItemProps.left - appListProps.left + "px";

    appList.appendChild(dragClone);
  }

  // calculate desired top relative to container
  let newTop = dragMoveY - appListProps.top - dragCursorFromTop;

  // clamp
  const maxTop = appListProps.height - dragStartItemProps.height;

  if (newTop < 0) newTop = 0;
  if (newTop > maxTop) newTop = maxTop;

  dragClone.style.top = `${newTop}px`;
};

const handleDragMouseUp = function(){
  dragStartItemProps = null;
  dragItemsProps.length = 0;
  isDragging = false;
}


// DOM references
const appList = document.querySelector('.app__list');
appList.addEventListener('change', handleSkillInput);
appList.addEventListener('click', handleSkillDelete);

// Drag event listeners

appList.addEventListener('mousedown', handleDragMouseDown);
document.addEventListener('mousemove', handleDragMouseMove);
document.addEventListener('mouseup', handleDragMouseUp);



const skillsList = document.querySelector('.skills__list');
skillsList.addEventListener('click', handleSuggestedSkillClick);

// Initial render
renderAppList(userSkills, appList);
updateInputFields(appList);
