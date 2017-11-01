import Ember from 'ember';
import { test } from 'qunit';
import moduleForAcceptance from 'frontend/tests/helpers/module-for-acceptance';

let surveyTemplate, question, rule, conditions;
moduleForAcceptance('Acceptance | question conditionals', {
  beforeEach() {
    server.loadFixtures();
    surveyTemplate = server.create('survey-template');
  }
});

// Conditional tabs shouldn't be enable on for new questions
test('creating new question hides conditional tab', function(assert) {
  visit(`/survey_templates/${surveyTemplate.id}`);
  andThen(function() {
    click('a:contains("Add")').then(()=>{
      assert.notEqual(find('[href="#tab-question-conditionals"]').text().trim(), 'Conditionals', 'Hide conditional tab');
    });
  });
});

test('adding a conditional with a question without rule previously created', async function(assert) {
  server.createList('question', 5, { surveyTemplate });
  question = server.create('question', { surveyTemplate });

  await visit(`/survey_templates/${surveyTemplate.id}/questions/${question.id}`);

  assert.equal(0, server.schema.rules.all().models.length);
  await click('[data-test="add-condition-link"]');
  // Select question
  fillIn('[data-test="condition-question-id-select"]', 3);
  await triggerEvent('[data-test="condition-question-id-select"]', 'onchange');

    fillIn('[data-test="condition.answer"]', 'e quiai');
    click('[data-test="save-condition-link"]').then(()=>{
      click('[data-test="save-question-link"]').then(()=>{
        assert.equal(1, server.schema.rules.all().models.length);
        let condition = server.db.conditions[0];
        assert.equal(condition.answer, 'e quiai');
        assert.equal(condition.operator, 'is greater than');
      });
    });

  fillIn('[data-test="condition.answer"]', 'e quiai');
  await click('[data-test="save-condition-link"]');
  await click('[data-test="save-question-link"]');

  assert.equal(1, server.schema.rules.all().models.length);

  let condition = server.db.conditions[0];
  assert.equal(condition.answer, 'e quiai');
  assert.equal(condition.operator, 'is greater than');
});

test('editing a conditional', function(assert) {
  server.createList('question', 5, { surveyTemplate });
  rule = server.create('rule');
  conditions = server.createList('condition', 3, { rule, question_id: 3 });
  question = server.create('question', { surveyTemplate, rule });
  server.db.rules.update(rule.id, { question_id: question.id });

  let firstCondition = conditions[0];

  visit(`/survey_templates/${surveyTemplate.id}/questions/${question.id}`);
  andThen(function() {
    for (let condition of conditions) {
      assert.equal(condition.answer, find(`[data-condition-id="${condition.id}"] [data-test="condition.answer"]`).text().trim());
    }
    let selector = `[data-condition-id="${firstCondition.id}"]`;
    click(`${selector} [data-test="edit-condition-link"]`);
    fillIn(`${selector} [data-test="condition.answer"]`, 'eh eh epa colombia');
    click(`${selector} [data-test="save-condition-link"]`).then(()=>{
      firstCondition = server.db.conditions.find(firstCondition.id);
      assert.equal(firstCondition.answer, 'eh eh epa colombia');
    });
  });
});

test('deleting a conditional', function(assert) {
  server.createList('question', 5, { surveyTemplate });
  rule = server.create('rule');
  conditions = server.createList('condition', 3, { rule, question_id: 3 });
  question = server.create('question', { surveyTemplate, rule });
  rule = server.db.rules.update(rule.id, { question_id: question.id });

  let firstCondition = conditions[0];

  visit(`/survey_templates/${surveyTemplate.id}/questions/${question.id}`);

  andThen(function() {
    let selector = `[data-condition-id="${firstCondition.id}"]`;

    click(`${selector} [data-test="delete-condition-link"]`).then(()=>{
      assert.notEqual(firstCondition.answer, find('[data-test="condition.answer"]:first').text().trim());
    });
    visit(`/survey_templates/${surveyTemplate.id}/questions/${question.id}`).then(()=>{
      assert.notEqual(firstCondition.answer, find('[data-test="condition.answer"]:first').text().trim());
    });
  });
});

test('selecting a conditional question with answer choices', function(assert) {
  // Question with answer choices
  let questionWithAnsweChoices = server.create('question', { surveyTemplate, answer_type_id: 17 });
  let answerChoices = server.createList('answer-choice', 3, { question: questionWithAnsweChoices });
  let rule = server.create('rule');
  let toTestCondition = server.create('condition', { rule, question_id: questionWithAnsweChoices.id });
  let question = server.create('question', { surveyTemplate, rule });

  rule = server.db.rules.update(rule.id, { question_id: question.id });

  let firstAnswerChoice = answerChoices[0];

  visit(`/survey_templates/${surveyTemplate.id}/questions/${question.id}`);

  andThen(function() {
    let selector = `[data-condition-id="${toTestCondition.id}"]`;
    click(`${selector} [data-test="edit-condition-link"]`);

    // Select operator
    fillIn(`${selector} [data-test="condition-answer-choice-dropdown"]`, firstAnswerChoice.option_text);
    triggerEvent(`${selector} [data-test="condition-answer-choice-dropdown"]`, 'onchange');

    click(`${selector} [data-test="save-condition-link"]`).then(()=>{
      toTestCondition = server.db.conditions.find(toTestCondition.id);
      assert.equal(toTestCondition.answer, firstAnswerChoice.option_text);
    });
  });
});
