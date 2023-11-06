import numpy as np
import time
import nltk
from nltk.stem.lancaster import LancasterStemmer
import os
import json
import datetime
import random
import sys
stemmer = LancasterStemmer()

intents=json.load(open('chatbot/chatbot.json'))

words=[]
classes=[]
documents=[]
ignore_words = ['?']

# for i in intents['intents']:
#     for p in i['patterns']:
#         w = nltk.word_tokenize(p)
#         words.extend(w)
#         documents.append((w, i['tag']))
#         if i['tag'] not in classes:
#             classes.append(i['tag'])

# words = [stemmer.stem(w.lower()) for w in words if w not in ignore_words]
# words = sorted(list(set(words)))
# classes = sorted(list(set(classes)))


# compute sigmoid nonlinearity
def sigmoid(x):
    output = 1/(1+np.exp(-x))
    return output

# convert output of sigmoid function to its derivative
def sigmoid_output_to_derivative(output):
    return output*(1-output)
 
def clean_up_sentence(sentence):
    # tokenize the pattern
    sentence_words = nltk.word_tokenize(sentence)
    # stem each word
    sentence_words = [stemmer.stem(word.lower()) for word in sentence_words]
    return sentence_words

# return bag of words array: 0 or 1 for each word in the bag that exists in the sentence
def bow(sentence, words, show_details=False):
    # tokenize the pattern
    sentence_words = clean_up_sentence(sentence)
    # bag of words
    bag = [0]*len(words)  
    for s in sentence_words:
        for i,w in enumerate(words):
            if w == s: 
                bag[i] = 1
                if show_details:
                    print ("found in bag: %s" % w)

    return(np.array(bag))

def think(sentence, show_details=False):
    x = bow(sentence.lower(), words, show_details)
    if show_details:
        print ("sentence:", sentence, "\n bow:", x)
    # input layer is our bag of words
    l0 = x
    # matrix multiplication of input and hidden layer
    l1 = sigmoid(np.dot(l0, synapse_0))
    # output layer
    l2 = sigmoid(np.dot(l1, synapse_1))
    return l2

# probability threshold
ERROR_THRESHOLD = 0.3
# load our calculated synapse values
synapse_file = 'chatbot/synapses.json' 
with open(synapse_file) as data_file: 
    synapse = json.load(data_file) 
    synapse_0 = np.asarray(synapse['synapse0']) 
    synapse_1 = np.asarray(synapse['synapse1'])
    words=np.asarray(synapse['words'])
    classes=np.asarray(synapse['classes'])

def classify(sentence, show_details=False):
    results = think(sentence, show_details)
    # print(results)
    results = [[i,r] for i,r in enumerate(results) if r>ERROR_THRESHOLD ] 
    results.sort(key=lambda x: x[1], reverse=True) 
    return_results =[[classes[r[0]],r[1]] for r in results]
    # print ("%s \n classification: %s" % (sentence, return_results))
    return return_results


d={}
t1=time.time()
r=classify(sys.argv[1])
print("Time taken is {0}".format((time.time()-t1)))
if r:
    for i in intents['intents']:
        if r[0][0]==i['tag']:
            print(random.choice(i['responses']))
            d['reply']=random.choice(i['responses'])
else:
    print("i don't know")
    d['reply']="i don't know"


r = json.dumps(d)
fj=open("chat_reply.json","w")
fj.write(r)
fj.close()