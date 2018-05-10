import Component from '@ember/component';
import { A } from '@ember/array';
import { run } from '@ember/runloop';
import { alias, sort } from '@ember/object/computed';
import { task, all } from 'ember-concurrency';
import { inject as service } from '@ember/service';
import { isBlank } from '@ember/utils';
import $ from 'jquery';

export default Component.extend({
  store: service(),
  notify: service(),

  questionsSorting: ['sortOrder'],
  sortedQuestions: sort('surveyTemplate.filteredquestions', 'questionsSorting'),
  isFullyEditable: alias('surveyTemplate.fullyEditable'),

  init() {
    this._super(...arguments);
    this.selectedQuestions = A();
  },

  duplicateQuestionsTask: task(function*() {
    let selectedQuestions = this.get('selectedQuestions');
    let store = this.get('store');
    let surveyTemplate = this.get('surveyTemplate');
    let duplicatingSection = false;

    // If there are entire sections / repeaters then dont copy them all
    let toDuplicateQuestions = selectedQuestions.filter(function(toDuplicateQuestion) {
      if (isBlank(toDuplicateQuestion.get('ancestry'))) {
        return true;
      }
      let ancestrires = toDuplicateQuestion.get('ancestry').split('/');
      return selectedQuestions.some(function(question) {
        ancestrires.includes(question.get('id'));
      });
    });

    try {
      let duplicatedResponse = yield all(
        toDuplicateQuestions.map((question) => {
          let params = { section: false };
          if (question.get('isContainer') || question.get('isARepeater')) {
            params.section = true;
            duplicatingSection = true;
          }
          return question.duplicate(params);
        })
      );
      if (duplicatingSection) {
        yield surveyTemplate.reload();
        yield surveyTemplate.get('questions');
      } else {
        duplicatedResponse.forEach((response) => {
          store.pushPayload(response);
          // Refactor once `ds-pushpayload-return` is enabled on ember data
          let duplicated = store.peekRecord('question', response.question.id);
          surveyTemplate.get('questions').pushObject(duplicated);
        });
      }
      selectedQuestions.forEach((q) => q.set('ancestrySelected', false));
      this.get('notify').success('Questions successfully duplicated');
      this.set('selectedQuestions', A());
    } catch(e) {
      this.get('notify').alert('There was an error trying to duplicate questions');
    }
  }).drop(),

  actions: {
    clearAll() {
      // Clean state
      this.get('selectedQuestions').forEach((question) => question.set('ancestrySelected', false));
      this.set('selectedQuestions', A());
    },
    toggleQuestion(question, add = true) {
      let selectedQuestions = this.get('selectedQuestions');
      let included = selectedQuestions.includes(question);
      if (add && !included) {
        selectedQuestions.addObject(question);
      } else if (!add && included) {
        selectedQuestions.removeObject(question);
      }
    },
    deleteQuestion(question, elRow) {
      let $confirm = $('.delete-confirm', elRow);
      let questionId = question.get('id');
      question.deleteRecord();
      question.save().then(() => {
        let childrenQuestions = this.get('surveyTemplate.questions').filterBy('ancestry', questionId.toString());
        for (let childQuestion of childrenQuestions) {
          childQuestion.deleteRecord();
        }
        $confirm.fadeOut();
      });
    },
    setAncestry(question, opts) {
      let ancestryQuestion = opts.target.acenstry;
      let parentId = ancestryQuestion.get('id');
      let parentChildren = this.get('surveyTemplate.questions')
        .filterBy('parentId', parentId)
        .sortBy('sortOrder');
      let lastChild = parentChildren.get('lastObject');
      let sortOrder = lastChild ? lastChild.get('sortOrder') : ancestryQuestion.get('sortOrder');

      question.set('loading', true);
      question.set('parentId', parentId);
      question.set('sortOrder', sortOrder);
      question.save().then(() => {
        question.reload();
        run.later(
          this,
          () => {
            this.sendAction('updateSortOrder', this.get('sortedQuestions'));
            question.set('loading', false);
          },
          1000
        );
      });
    },
    dragStarted(question) {
      $('.draggable-object-target')
        .parent(`:not(.model-id-${question.get('parentId')})`)
        .addClass('dragging-coming-active');
    },
    dragEnded() {
      $('.draggable-object-target')
        .parent()
        .removeClass('dragging-coming-active');
    },
    dragOver() {
      run.next(this, function() {
        $('.accepts-drag')
          .parent()
          .addClass('dragging-over');
      });
    },
    dragOut() {
      $('.draggable-object-target')
        .parent()
        .removeClass('dragging-over');
    }
  }
});
