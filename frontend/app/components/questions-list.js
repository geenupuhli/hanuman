import Ember from 'ember';
const {
  computed: { sort }
} = Ember;

export default Ember.Component.extend({
  questionsSorting: ['sortOrder'],
  sortedQuestions: sort('surveyTemplate.filteredquestions', 'questionsSorting'),
  actions:{
    deleteQuestion(question, elRow){
      let $confirm = Ember.$('.delete-confirm', elRow),
          questionId = question.get('id');
      question.deleteRecord();
      question.save().then(()=>{
        let childrenQuestions = this.get('surveyTemplate.questions').filterBy('ancestry',questionId.toString());
        for (var childQuestion of childrenQuestions) {
          childQuestion.deleteRecord();
        }
        $confirm.fadeOut();
      });
    }
  }
});
