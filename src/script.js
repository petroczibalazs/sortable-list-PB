/**
 * @param {*} skillIndex
 * @param {*} skillName
 * @returns
 */
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

/**
 *
 * @returns
 */
const getDragMarker = function(){

  const templateHTML = `<li class="drag-marker"></li>`;

  const templateEL = document.createElement('template');
  templateEL.innerHTML = templateHTML;
  return templateEL.content.firstElementChild;

}

const getAppBoxWrapper = function(){

  const templateHTML =
  `
  <div class="app__box-wrapper">
    <ul class="app__suggestion-box">
    </ul>
  </div>
  `;

  const template = document.createElement('template');
  template.innerHTML = templateHTML;
  return template.content.firstElementChild;
};

const getSkillItem = function( skillText ){

  const templateHTML = `
  <li class="app__skill-item">
  ${skillText}
  </li>
  `;

  const template = document.createElement('template');
  template.innerHTML = templateHTML;
  return template.content.firstElementChild;
}


// User skill array
const userSkills = ['Javascript', 'ReactJs', 'NextJs'];

// Drag-related variables
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


// Helpers
const isNewSkill = function (skill) {

  return userSkills.indexOf(skill.trim()) === -1? true : false;
};


// Add skill from text input
const handleSkillInput = function (e) {
  const inputEl = e.target;
  const typedSkill = inputEl.value.trim();
  const inputParent = inputEl.parentNode;


  if( isNewSkill( typedSkill ) === false ) {
    inputEl.setAttribute('placeholder', `${typedSkill} is already in your skills!`);

    inputEl.value = '';
    hideAppBoxWrapper(appBoxWrapper);
    return;
  }

  const nextSkillIndex = userSkills.length;
  const newListItem = getAppListItem( nextSkillIndex, typedSkill );

  inputParent.replaceWith( newListItem );
  userSkills.push( typedSkill );
  updateInputFields( appList );
};

const addNewListItem = function( skillName ){

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

// Add skill from suggested list
const handleSuggestedSkillClick = function (e) {

  if (!e.target.closest('.skills__item')) return;

  const newSkillName = e.target.textContent
  .trim()
  .replace(/\s*[+]\s*/, '');

  addNewListItem( newSkillName );

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

    const ordinalSpan = item.querySelector('.app__item-ordinal');
    ordinalSpan.textContent = `${index + 1}. `;

  });
};


// Delete a skill ( from userSkills array  and the appList item )
const handleSkillDelete = function (e) {
  if (!e.target.closest('.app__icon')) return;

  let clickedItem = e.target;
  while (clickedItem.nodeName !== 'LI') clickedItem = clickedItem.parentNode;

  if (clickedItem.classList.contains('app__item--input')) return;

  const skillName = clickedItem.textContent.replace(/\d+\.\s*/, '').trim();
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

// ignore clicking on icons and stop fireing the method repeatedly on real ( not cloned ) LI-s
const icon = e.target.closest('.app__icon');
if (icon && icon.closest('.app__item') && !icon.classList.contains("clonedItem")) {
  return;
}

// ignore clicking on clone and inside input elements
if (e.target.closest('.clonedItem')) return;
if (e.target.closest('.app__item--input')) return;


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

  // ensure dragMarker exists
  if( !dragMarker ){

    dragMarker = getDragMarker();
    appList.appendChild( dragMarker );
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

  for ( let [__, itemProps] of dragItemsProps.entries()){

    const labelMiddle = itemProps.middle - appListProps.top;

    if( Math.abs( labelMiddle - newMiddle ) < distance ) {
      distance = labelMiddle - newMiddle;
      aboveOrUnder = distance < 0? 'under' : 'above';
      distance = Math.abs( labelMiddle - newMiddle );
      dragClosestItemProps = itemProps;
    }
  }

  let  dragMarkerTop = 0;

  if( aboveOrUnder === 'above'){
    dragMarkerTop = dragClosestItemProps.top - appListProps.top - 10;
  }
  else{
    dragMarkerTop = dragClosestItemProps.top - appListProps.top + dragClosestItemProps.height + 5;
  }

  dragMarker.style.top = `${dragMarkerTop}px`;


};

// clean up after mouse up
const handleDragMouseUp = function(){

  if( !isDragging ) return;

    const moveItem = function(arr, from, to) {

          const item = arr[from];
          arr.splice(from, 1);
          if (to > from) to--;
          arr.splice(to, 0, item);
    }

  if( dragClosestItemProps ){

    const closestItemIndex = dragClosestItemProps.index;
    const dragItemIndex = dragStartItemProps.index;


    const closestItem = appList.children[ closestItemIndex ];
    const dragItem = appList.children[ dragItemIndex ];

    if( aboveOrUnder === 'above'){
      closestItem.insertAdjacentElement('beforebegin', dragItem);
    }else{
      closestItem.insertAdjacentElement('afterend', dragItem);
    }

    // refresh userSkills array
    if(dragItemIndex != closestItemIndex ){

      let fromIndex = dragItemIndex;
      let toIndex = closestItemIndex;

      if( aboveOrUnder === 'under'){
        toIndex++;
      }

      moveItem( userSkills, fromIndex, toIndex );
    }
  }


  dragStartItemProps = null;
  dragItemsProps.length = 0;
  isDragging = false;

  if( dragClone ){
    dragClone.remove();
    dragClone = null;
  }

  if( dragMarker ){
    dragMarker.remove();
    dragMarker = null;
  }

  refreshSkillLabels(appList);
}


// DOM references
const appList = document.querySelector('.app__list');
const skillsList = document.querySelector('.skills__list');


appList.addEventListener('change', handleSkillInput);
appList.addEventListener('click', handleSkillDelete);

// Drag event listeners

appList.addEventListener('mousedown', handleDragMouseDown);
document.addEventListener('mousemove', handleDragMouseMove);
document.addEventListener('mouseup', handleDragMouseUp);



skillsList.addEventListener('click', handleSuggestedSkillClick);

// Initial render
renderAppList(userSkills, appList);
updateInputFields(appList);


// SUGGESTION BOX parts

let skillsBox = null;
let appBoxWrapper = null;
let selectedSkill = null;
let isSkillsBoxVisible = false;

const suggestions =
[
  'JavaScript',
  'Python',
  'Java',
  'C#',
  'C++',
  'TypeScript',
  'HTML',
  'CSS',
  'React',
  'Angular',
  'Vue.js',
  'Node.js',
  'Express.js',
  'Django',
  'Flask',
  'SQL',
  'NoSQL',
  'MongoDB',
  'PostgreSQL',
  'Git',
  'Docker',
  'Kubernetes',
  'AWS',
  'Azure',
  'Google Cloud Platform',
  'Linux Administration',
  'Network Security',
  'Machine Learning',
  'Data Analysis',
  'API Development'
];


const hideAppBoxWrapper = function( appBoxWrapper ){

  appBoxWrapper.classList.remove('app__box-wrapper--visible');
};

const moveFocusUp = function(  ){

}

const moveFocusDown = function(){


}

const renderSkillsBox= function( skillsBox, skills = []){

    while( skillsBox.firstChild ){
      skillsBox.removeChild(
        skillsBox.firstChild
      )
    };

    skills.forEach( skill => {
      const listItem = getSkillItem(skill);
      skillsBox.appendChild( listItem );
    } );

};


const handleSkillInputTyping = function( e ){

  const activeInput = e.target;
  const activeInputLi = activeInput.parentNode;
  const appInputLis = [...appList.children]
  .filter( item => item.classList.contains('app__item--input' ));


  const inputText = activeInput.value
  .trim()
  .toLowerCase();

  if( inputText ==="") {
    hideAppBoxWrapper( appBoxWrapper );
    return;
  }

  const matchingSuggestions = suggestions.filter( suggestion =>
    suggestion.toLowerCase()
    .trim()
    .startsWith(inputText) );

  if( matchingSuggestions.length > 0 ){

    if(appBoxWrapper == null ) {
      appBoxWrapper = getAppBoxWrapper();
      skillsBox = appBoxWrapper.querySelector('.app__suggestion-box');
    }

    renderSkillsBox( skillsBox, matchingSuggestions );


    appInputLis.forEach( Li => Li.style.zIndex = '0');
    activeInputLi.style.zIndex = '100';

    activeInputLi.appendChild(appBoxWrapper);
    skillsBox.offsetHeight;
    appBoxWrapper.classList.add('app__box-wrapper--visible');
  }
  else {

    hideAppBoxWrapper(appBoxWrapper)
  }
};

const handleDocumentInteractions = function( e ){


  if( !appBoxWrapper ) return;
  if( !e.target.closest('.app__skill-item'))  {

    hideAppBoxWrapper(appBoxWrapper);
    return;
  }

  const targetSkill = e.target.textContent.trim();
  addNewListItem( targetSkill);
}

appList.addEventListener('input', handleSkillInputTyping);
document.addEventListener('mouseup', handleDocumentInteractions)