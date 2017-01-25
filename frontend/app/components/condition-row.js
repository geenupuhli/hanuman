import Ember from 'ember';

const {
  computed,
  computed: { alias }
} = Ember;

export default Ember.Component.extend({
  for: alias('condition'),
  tagName: 'tr',
  attributeBindings: ['condition.id:data-condition-id'],
  classNameBindings: ['isNewCondition:no-hover'],
  isEditingCondition: false,
  operators: [
                'is equal to',
                'is not equal to',
                'is empty',
                'is not empty',
                'is greater than',
                'is less than',
                'starts with',
                'contains'
              ],
  currentQuestion: computed('condition.questionId', function() {
    return this.get('questions').findBy('id',this.get('condition.questionId'));
  }),

  questionAnswerChoices: computed('currentQuestion', function() {
    return this.get('currentQuestion.answerChoices');
  }),

  useDropDownAnswerSelect: computed('currentQuestion', function() {
    let currentQuestion = this.get('currentQuestion');
    return currentQuestion && currentQuestion.hasMany('answerChoices').ids().length > 1;
  }),

  setNewCondition() {
    let condition = this.get('rule').store.createRecord('condition',{
      questionId: this.get('questions.firstObject.id')
    });
    this.set('condition', condition);
  },

  actions: {
    toggleForm() {
      this.toggleProperty('isEditingCondition');
      if(Ember.isNone(this.get('condition'))){
        this.setNewCondition();
      }
    },

    save() {
      let condition = this.get('condition');
      if(condition.validate()){

        if(this.get('useDropDownAnswerSelect')){
          let currentQuestion = this.get('currentQuestion'),
              firstAnswerChoice = currentQuestion.get('answerChoices.firstObject');
          condition.set('answer',firstAnswerChoice.get('optionText'));
        }

        condition.set('rule', this.get('rule'));
        this.sendAction('save',condition);
        if(this.get('isNewCondition')){
          this.set('condition',null);
        }
        this.send('toggleForm');
      }
    },

    delete() {
      let condition = this.get('condition');
      this.sendAction('remove',condition);
    },
    setConditionOperator(operator){
      this.set('condition.operator',operator);
    },
    setConditionQuestion(questionId){
      this.set('condition.questionId',questionId);
    },
    setConditionAnswer(answer){
      this.set('condition.answer',answer);
    }
  }
});
