module Hanuman
  class AnswerChoice < ActiveRecord::Base
    has_paper_trail
    has_ancestry
    belongs_to :question
    
    before_save :protect_split
    
    def protect_split
      #ensures that we can count on ' / ' (space forward-slash space)
      #only occurring once in the formatted_answer_choice so we can
      #later rely on .split(' / ') to break apart a stored answer string
      #back into option_text and scientific_text respectively
      option_text = option_text.strip.gsub(' / ', '/') unless option_text.blank?
      scientific_text = scientific_text.strip.gsub(' / ', '/') unless scientific_text.blank?
    end
    
    def self.all_sorted
      order("option_text ASC, scientific_text ASC")
    end

    def formatted_answer_choice
      answer_choice = scientific_text.blank? ? option_text : scientific_text +  ' / ' + option_text
      #this is a very nice convenience but it's causing massive n+1 queries on biosurvey
      #answer_choice += self.parent.blank? ? '' : ' ( ' + self.parent.option_text + ' )'
    end
  end
end
