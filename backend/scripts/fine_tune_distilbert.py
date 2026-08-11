import os
import torch
import numpy as np
from datasets import Dataset
from transformers import (
    DistilBertTokenizer,
    DistilBertForSequenceClassification,
    Trainer,
    TrainingArguments,
    DataCollatorWithPadding
)

# 5 Mandated Civic Categories
CATEGORIES = [
    "Sanitary & Public Hygiene",
    "Service Delivery Deficiencies",
    "Administrative Delays and Maladministration",
    "Abuse of Power or Corruption",
    "Systemic and Policy Issues"
]

CATEGORY_TO_ID = {cat: i for i, cat in enumerate(CATEGORIES)}
ID_TO_CATEGORY = {i: cat for i, cat in enumerate(CATEGORIES)}

# Synthetic Dataset with Edge Cases
SYNTHETIC_DATA = [
    {"text": "garbage burning on main road causing smoke", "label": "Sanitary & Public Hygiene"},
    {"text": "open sewage leak flooding the street", "label": "Sanitary & Public Hygiene"},
    {"text": "water pipeline burst no supply", "label": "Service Delivery Deficiencies"},
    {"text": "street lights not working since 3 days", "label": "Service Delivery Deficiencies"},
    {"text": "birth certificate application pending for months", "label": "Administrative Delays and Maladministration"},
    {"text": "officer demanding bribe for noc clearance", "label": "Abuse of Power or Corruption"},
    {"text": "potholes on the road making it dangerous", "label": "Systemic and Policy Issues"},
    {"text": "no wheelchair ramp at public building", "label": "Systemic and Policy Issues"},
    # Standard Examples
    {"text": "too much trash in the corner", "label": "Sanitary & Public Hygiene"},
    {"text": "power outage in my area", "label": "Service Delivery Deficiencies"},
    {"text": "zonal office is delaying my file", "label": "Administrative Delays and Maladministration"},
    {"text": "extortion by local mafia for construction", "label": "Abuse of Power or Corruption"},
    {"text": "bad road design causing accidents", "label": "Systemic and Policy Issues"},
]

def main():
    print("Initializing DistilBERT fine-tuning pipeline...")
    
    # 1. Load Tokenizer
    model_name = "distilbert-base-uncased"
    tokenizer = DistilBertTokenizer.from_pretrained(model_name)
    
    # 2. Prepare Dataset
    texts = [item["text"] for item in SYNTHETIC_DATA]
    labels = [CATEGORY_TO_ID[item["label"]] for item in SYNTHETIC_DATA]
    
    dataset = Dataset.from_dict({
        "text": texts,
        "label": labels
    })
    
    def tokenize_function(examples):
        return tokenizer(examples["text"], padding="max_length", truncation=True, max_length=128)
    
    tokenized_datasets = dataset.map(tokenize_function, batched=True)
    
    # Split into train/test (simple 80-20 split for demo)
    tokenized_datasets = tokenized_datasets.train_test_split(test_size=0.2)
    train_dataset = tokenized_datasets["train"]
    eval_dataset = tokenized_datasets["test"]
    
    data_collator = DataCollatorWithPadding(tokenizer=tokenizer)
    
    # 3. Load Model
    model = DistilBertForSequenceClassification.from_pretrained(
        model_name,
        num_labels=len(CATEGORIES),
        id2label=ID_TO_CATEGORY,
        label2id=CATEGORY_TO_ID
    )
    
    # 4. Training Arguments
    training_args = TrainingArguments(
        output_dir="./distilbert_civickural_model",
        learning_rate=2e-5,
        per_device_train_batch_size=4,
        per_device_eval_batch_size=4,
        num_train_epochs=3,
        weight_decay=0.01,
        eval_strategy="epoch",
        save_strategy="epoch",
        load_best_model_at_end=True,
    )
    
    # 5. Trainer
    trainer = Trainer(
        model=model,
        args=training_args,
        train_dataset=train_dataset,
        eval_dataset=eval_dataset,
        tokenizer=tokenizer,
        data_collator=data_collator,
    )
    
    print("Starting training...")
    # NOTE: Uncomment to actually train. In a real environment, this takes time and requires GPU.
    # trainer.train()
    
    print("Saving model...")
    # trainer.save_model("./distilbert_civickural_final")
    
    print("Fine-tuning script preparation complete.")

if __name__ == "__main__":
    main()
