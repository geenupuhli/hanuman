import Ember from 'ember';
import { moduleForModel, test } from 'ember-qunit';

moduleForModel('answer-type', 'Unit | Model | answer type', {
  // Specify the other units that are required for this test.
  needs: [
    'model:question'
  ]
});

test('it exists', function(assert) {
  let model = this.subject();
  // let store = this.store();
  assert.ok(!!model);
});

test('hasAnswerChoices', function(assert) {
  let model = this.subject();
  assert.notOk(model.get('hasAnswerChoices'));
  Ember.run(function() {
    for (let htmlType of model.get('types')) {
      model.set('name', htmlType);
      assert.ok(model.get('hasAnswerChoices'));
    }
  });
});
