module Hanuman
  class Condition < ActiveRecord::Base
    belongs_to :question
    belongs_to :rule

    validates :rule_id, presence: true
    #validates :question_id, presence: true - this validation breaks the duplicate functionality-kdh
    validates :operator, presence: true
    #validates :answer, presence: true - is empty and is not empty have nil values for answer so we can't validate presene of answer-kdh

    OPERATORS = ["is equal to", "is not equal to", "is empty", "is not empty", "is greater than", "is less than", "starts with", "contains"]
  end
end
