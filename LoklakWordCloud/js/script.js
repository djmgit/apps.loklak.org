var app = angular.module('loklakWordCloud', []);

app.controller("app", function ($scope, $http) {
    $scope.filteredWords = [];
    $scope.wordFreq = {};
    $scope.wordCloudData = [];
    $scope.wordCloud = null;

    $scope.search = function () {
        $scope.wordFreq = [];
        $scope.wordCloudData = [];
        $scope.filteredWords = [];
        $scope.wordFreq = {};
        var query = $scope.tweet.startsWith("#") ? $scope.tweet.substring(1) : $scope.tweet;
        var url = "http://35.184.151.104/api/search.json?callback=JSON_CALLBACK&count=100&q=" + query;
        $http.jsonp(url)
            .then(function (response) {
                $scope.createWordCloudData(response.data.statuses);
                $scope.tweet = null;
            });
    }
    $scope.createWordCloudData = function(data) {
        for (var i = 0; i < data.length; i++) {
            tweet = data[i];

            // use multiple delimiters for splitting
            tweetWords = tweet.text.split(/[\s,;]+/);

            for (var j = 0; j < tweetWords.length; j++) {
                word = tweetWords[j];
                word = word.trim();
                if (word === null) {
                    continue;
                }
                if (word.startsWith("'") || word.startsWith('"') || word.startsWith("(") || word.startsWith("[")) {
                    word = word.substring(1);
                }
                if (word.endsWith("'") || word.endsWith('"') || word.endsWith(")") || word.endsWith("]") ||
                    word.endsWith("?") || word.endsWith(".")) {
                    word = word.substring(0, word.length - 1);
                }

                if ((word.indexOf("<")) !== -1 || (word.indexOf(">") !== -1)) {
                    continue;
                }

                // discard words which contain only digits and nothing else
                if (/^[0-9]+([.,][0-9]+)?$/.test(word)) {
                    continue;
                }
                word = word.trim();
                if (stopwords.indexOf(word.toLowerCase()) !== -1) {
                    continue;
                }
                if (word.startsWith("#") || word.startsWith("@")) {
                    continue;
                }
                if (word.startsWith("http") || word.startsWith("https")) {
                    continue;
                }

                /* following two conditions handles cases where there is no delimiter between
                   a normal word and a hashtag or mention. We choose only the first word since
                   hashtags and mentions are handles separately
                 */
                if (word.indexOf("#") !== -1) {
                    word = word.split("#")[0];
                }
                if (word.indexOf("@") !== -1) {
                    word = word.split("@")[0];
                }
                $scope.filteredWords.push(word);
            }

            tweet.hashtags.forEach(function (hashtag) {
                $scope.filteredWords.push("#" + hashtag);
            });

            tweet.mentions.forEach(function (mention) {
                $scope.filteredWords.push("@" + mention);
            });
        }

        $scope.filteredWords.forEach(function (data) {
            data = data.toLowerCase();
            if ($scope.wordFreq[data] === undefined) {
                $scope.wordFreq[data] = 1;
            } else {
                $scope.wordFreq[data] += 1;
            }
        });

        for (var word in $scope.wordFreq) {
            $scope.wordCloudData.push({
                text: word,
                weight: $scope.wordFreq[word],
                handlers: {
                    click: function(e) {
                        $scope.tweet = e.target.textContent;
                        $scope.search();
                    }
                }
            });
        }

        $scope.generateWordCloud();
    }

    $scope.generateWordCloud = function() {
        if ($scope.wordCloud === null) {
            $scope.wordCloud = $('.wordcloud').jQCloud($scope.wordCloudData, {
                colors: ["#D50000", "#FF5722", "#FF9800", "#4CAF50", "#8BC34A", "#4DB6AC", "#7986CB", "#5C6BC0", "#64B5F6"],
                fontSize: {
                    from: 0.06,
                    to: 0.01
                },
                autoResize: true
            });
        } else {
            $scope.wordCloud = $(".wordcloud").jQCloud('update', $scope.wordCloudData);
        }
    }
});
